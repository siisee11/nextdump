import { useEffect, useState } from "react";
import { DatabaseCloudIcon, LoaderIcon, LockIcon } from "@/components/icons";
import { PremadeAppsList } from "@/components/premade-apps-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTestConnection } from "@/hooks/useTestConnection";
import type { DemoApp } from "@/lib/demo-config";

interface DemoDbConnectStepProps {
	apps: DemoApp[];
	connectionString: string;
	onConnectionStringChange: (value: string) => void;
	isConnectionValid: boolean;
	onConnectionValidated: (isValid: boolean) => void;
	onRunDemo: () => void;
}

const APPS_DISPLAY_DURATION = 5000; // 5 seconds

/**
 * Step 4: Database Connection
 * Shows created apps for 5 seconds, then database connection form
 */
export function DemoDbConnectStep({
	apps,
	connectionString,
	onConnectionStringChange,
	isConnectionValid,
	onConnectionValidated,
	onRunDemo,
}: DemoDbConnectStepProps) {
	const [showDbForm, setShowDbForm] = useState(false);

	const { mutate: testConnection, isPending: isTesting } = useTestConnection({
		onSuccess: (result) => {
			onConnectionValidated(result.success);
		},
		onError: () => {
			onConnectionValidated(false);
		},
	});

	const handleTest = (value?: string) => {
		const stringToTest = value ?? connectionString;
		if (!stringToTest.trim()) return;
		testConnection({ connectionString: stringToTest.trim() });
	};

	const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
		const pastedText = e.clipboardData.getData("text");
		if (pastedText.trim()) {
			// Update the connection string and test immediately
			onConnectionStringChange(pastedText);
			onConnectionValidated(false);
			handleTest(pastedText);
		}
	};

	useEffect(() => {
		const timer = setTimeout(() => {
			setShowDbForm(true);
		}, APPS_DISPLAY_DURATION);

		return () => clearTimeout(timer);
	}, []);

	// Phase 1: Show apps list
	if (!showDbForm) {
		return (
			<div className="h-full flex items-center justify-center py-2">
				<PremadeAppsList apps={apps} />
			</div>
		);
	}

	// Phase 2: Show database connection form
	return (
		<div className="h-full flex flex-col items-center justify-center px-6 py-4">
			<div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
				{/* Title */}
				<h2 className="text-xl font-bold text-gray-900 mb-4">Connect Your Database</h2>

				{/* Database Cloud Icon */}
				<DatabaseCloudIcon className="w-28 h-28 mb-6" />

				{/* Connection Input with Lock Icon */}
				<div className="w-full relative mb-3">
					<LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
					<Input
						type="password"
						value={connectionString}
						onChange={(e) => {
							onConnectionStringChange(e.target.value);
							onConnectionValidated(false);
						}}
						onPaste={handlePaste}
						placeholder="Enter PostgreSQL connection string..."
						disabled={isTesting}
						className="pl-10 h-12 text-sm bg-gray-50 border-gray-200 rounded-xl"
					/>
				</div>
			</div>

			{/* Run Demo Button - Outside the card */}
			<Button
				onClick={onRunDemo}
				disabled={!isConnectionValid}
				className="w-full max-w-sm h-12 mt-4 rounded-xl bg-rose-400 hover:bg-rose-500 disabled:bg-rose-300 text-white font-medium text-base"
			>
				Run Demo
			</Button>
		</div>
	);
}
