import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { Navbar } from './components/Navbar';
import './App.css';

function App() {
	return (
		<BrowserRouter>
			<Navbar />
			<Routes>
				<Route
					path='/'
					element={<HomePage />}
				/>
				<Route
					path='/resources/:id'
					element={
						<div className='mx-auto max-w-4xl px-6 py-16 text-slate-300'>
							Resource detail view coming soon.
						</div>
					}
				/>
			</Routes>
		</BrowserRouter>
	);
}

export default App;
