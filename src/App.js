import { Route, Routes } from 'react-router-dom';
import NavBar from './components/nav-bar.js';
import Home from './components/home.js';
import EventCrud from './components/eventCrud.js';
import RemedyCrud from './components/remedyCrud.js';

function App() {
    return (
        <>
            <NavBar />
            <Routes>
                <Route exact path='/' element={<Home />} />
                <Route path='/events' element={<EventCrud />} />
                <Route path='/remedies' element={<RemedyCrud />} />
            </Routes>
        </>
    );
}

export default App;
