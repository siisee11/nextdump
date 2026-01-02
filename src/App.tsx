import { Route, Switch } from "wouter";
import { DemoProjectPage } from "@/components/demo-project-page";
import { LandingPage } from "@/components/landing-page";
import { ProjectPage } from "@/components/project-page";

export function App() {
	return (
		<Switch>
			<Route path="/">
				<LandingPage />
			</Route>
			<Route path="/p/:projectId">
				<ProjectPage />
			</Route>
			<Route path="/demo/:projectId">
				<DemoProjectPage />
			</Route>
		</Switch>
	);
}

export default App;
