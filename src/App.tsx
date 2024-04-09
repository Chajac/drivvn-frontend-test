import { ThemeProvider } from "@/components/ThemeProvider";
import { ModeToggle } from "@/components/ModeToggle";
import "./App.css";
import { Toaster } from "./components/ui/toaster";

function App() {
	return (
		<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
			<div className="flex flex-row justify-between ">
				<h1 className=" top-0 left-3 m-3 text-4xl">SNAP!</h1>
				<div className=" top-0 right-0 m-3">
					<ModeToggle />
				</div>
			</div>
			<Toaster />
		</ThemeProvider>
	);
}

export default App;
