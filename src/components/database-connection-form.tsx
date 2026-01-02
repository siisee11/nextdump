import { useState } from "react";
import { AlertCircleIcon, CheckCircleIcon, DatabaseIcon, LoaderIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type TestConnectionResponse, useTestConnection } from "@/hooks/useTestConnection";

interface DatabaseConnectionFormProps {
	connectionString: string;
	onConnectionStringChange: (value: string) => void;
	onConnectionValidated?: (isValid: boolean) => void;
	disabled?: boolean;
}

export function DatabaseConnectionForm({
	connectionString,
	onConnectionStringChange,
	onConnectionValidated,
	disabled = false,
}: DatabaseConnectionFormProps) {
	const [testResult, setTestResult] = useState<TestConnectionResponse | null>(null);

	const { mutate: testConnection, isPending: isTesting } = useTestConnection({
		onSuccess: (result) => {
			setTestResult(result);
			onConnectionValidated?.(result.success);
		},
		onError: () => {
			setTestResult({
				success: false,
				error: "Failed to test connection. Please try again.",
			});
			onConnectionValidated?.(false);
		},
	});

	const handleTest = () => {
		if (!connectionString.trim()) return;
		setTestResult(null);
		testConnection({ connectionString: connectionString.trim() });
	};

	const handleConnectionStringChange = (value: string) => {
		onConnectionStringChange(value);
		// Clear previous test result when connection string changes
		if (testResult) {
			setTestResult(null);
			onConnectionValidated?.(false);
		}
	};

	return (
		<div className="space-y-4">
			<div>
				<Label className="text-sm font-medium mb-2 flex items-center gap-2">
					<DatabaseIcon className="size-4 text-primary" />
					PostgreSQL Connection
				</Label>
				<p className="text-xs text-muted-foreground mb-3">
					Enter your PostgreSQL connection string. Credentials are only used in-session and never
					stored.
				</p>
			</div>

			<div className="flex flex-col sm:flex-row gap-2">
				<div className="flex-1">
					<Input
						type="password"
						value={connectionString}
						onChange={(e) => handleConnectionStringChange(e.target.value)}
						placeholder="postgresql://user:password@host:5432/database"
						disabled={disabled || isTesting}
						className="font-mono text-sm"
					/>
				</div>
				<Button
					type="button"
					variant="outline"
					onClick={handleTest}
					disabled={disabled || isTesting || !connectionString.trim()}
				>
					{isTesting ? (
						<>
							<LoaderIcon className="size-4 mr-1 animate-spin" />
							Testing...
						</>
					) : (
						"Test Connection"
					)}
				</Button>
			</div>

			{/* Connection test result */}
			{testResult && (
				<div
					className={`flex items-start gap-2 p-3 rounded-lg border ${
						testResult.success
							? "border-green-500/50 bg-green-500/5 text-green-700 dark:text-green-400"
							: "border-destructive/50 bg-destructive/5 text-destructive"
					}`}
				>
					{testResult.success ? (
						<>
							<CheckCircleIcon className="size-5 shrink-0 mt-0.5" />
							<div>
								<p className="font-medium">Connected successfully</p>
								<p className="text-sm opacity-80">
									Database: <code className="font-mono">{testResult.database}</code>
									<span className="mx-2">•</span>
									{testResult.version}
								</p>
							</div>
						</>
					) : (
						<>
							<AlertCircleIcon className="size-5 shrink-0 mt-0.5" />
							<div>
								<p className="font-medium">Connection failed</p>
								<p className="text-sm opacity-80">{testResult.error}</p>
							</div>
						</>
					)}
				</div>
			)}

			{/* Security notice */}
			<p className="text-xs text-muted-foreground flex items-start gap-1.5">
				<span className="shrink-0">🔒</span>
				<span>
					Your connection string is sent directly to the server for testing and data insertion. It
					is never logged or persisted.
				</span>
			</p>
		</div>
	);
}
