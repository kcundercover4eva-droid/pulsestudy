import Home from './pages/Home';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Quests from './pages/Quests';
import Shop from './pages/Shop';
import GenerateContent from './pages/GenerateContent';


export const PAGES = {
    "Home": Home,
    "Leaderboard": Leaderboard,
    "Profile": Profile,
    "Quests": Quests,
    "Shop": Shop,
    "GenerateContent": GenerateContent,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
};