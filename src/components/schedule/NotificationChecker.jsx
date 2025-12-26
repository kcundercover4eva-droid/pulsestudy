import React, { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Bell, Clock } from 'lucide-react';

export default function NotificationChecker({ blocks }) {
  const notifiedRef = useRef(new Set());

  const { data: preferences } = useQuery({
    queryKey: ['notificationPreferences'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const prefs = await base44.entities.NotificationPreference.filter({ created_by: user.email });
      return prefs[0] || null;
    },
  });

  useEffect(() => {
    if (!preferences?.enabled || !blocks?.length) return;

    const checkNotifications = () => {
      const now = new Date();
      const currentDay = (now.getDay() + 6) % 7; // Convert to Mon=0, Sun=6
      const currentTime = now.getHours() + now.getMinutes() / 60;

      blocks.forEach(block => {
        // Only notify for blocks happening today
        if (block.day !== currentDay) return;

        // Check if this block type should trigger notifications
        if (!preferences.notifyForTypes?.includes(block.type)) return;

        // Check each reminder time
        preferences.reminderMinutes?.forEach(minutes => {
          const reminderTime = block.start - (minutes / 60);
          const timeDiff = (reminderTime - currentTime) * 60; // Convert to minutes

          // Trigger if within 1 minute of reminder time and not already notified
          const notificationKey = `${block.id}-${minutes}`;
          if (timeDiff >= 0 && timeDiff <= 1 && !notifiedRef.current.has(notificationKey)) {
            notifiedRef.current.add(notificationKey);

            // In-app notification
            if (preferences.inAppNotifications) {
              const hours = Math.floor(block.start);
              const mins = Math.round((block.start - hours) * 60);
              const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;

              toast(
                <div className="flex items-start gap-3">
                  <Bell className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white mb-1">Upcoming: {block.title}</div>
                    <div className="text-sm text-white/80">Starts at {timeStr} ({minutes} min)</div>
                  </div>
                </div>,
                {
                  duration: 5000,
                  className: 'glass bg-slate-900/90 border-cyan-500/50',
                }
              );
            }

            // Email notification
            if (preferences.emailNotifications) {
              base44.auth.me().then(user => {
                const hours = Math.floor(block.start);
                const mins = Math.round((block.start - hours) * 60);
                const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;

                base44.integrations.Core.SendEmail({
                  to: user.email,
                  subject: `Reminder: ${block.title} in ${minutes} minutes`,
                  body: `Your ${block.type} block "${block.title}" is starting at ${timeStr}.\n\nDon't forget to prepare!`
                }).catch(err => console.error('Email notification failed:', err));
              });
            }
          }
        });
      });
    };

    // Check immediately and then every minute
    checkNotifications();
    const interval = setInterval(checkNotifications, 60000);

    return () => clearInterval(interval);
  }, [blocks, preferences]);

  // Clear old notifications at midnight
  useEffect(() => {
    const clearOldNotifications = () => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        notifiedRef.current.clear();
      }
    };

    const interval = setInterval(clearOldNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  return null; // This is a background component
}