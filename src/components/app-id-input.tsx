import { useState } from "react";
import { PlusIcon, TrashIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface AppEntry {
	id: string;
	appId: string;
	tableName: string;
}

interface AppIdInputProps {
	apps: AppEntry[];
	onChange: (apps: AppEntry[]) => void;
	disabled?: boolean;
}

let entryCounter = 0;

function generateEntryId(): string {
	entryCounter += 1;
	return `entry-${Date.now()}-${entryCounter}`;
}

export function AppIdInput({ apps, onChange, disabled = false }: AppIdInputProps) {
	const [newAppId, setNewAppId] = useState("");
	const [newTableName, setNewTableName] = useState("");

	const handleAdd = () => {
		if (!newAppId.trim()) return;

		const entry: AppEntry = {
			id: generateEntryId(),
			appId: newAppId.trim(),
			tableName: newTableName.trim() || "",
		};

		onChange([...apps, entry]);
		setNewAppId("");
		setNewTableName("");
	};

	const handleRemove = (id: string) => {
		onChange(apps.filter((app) => app.id !== id));
	};

	const handleUpdateTableName = (id: string, tableName: string) => {
		onChange(apps.map((app) => (app.id === id ? { ...app, tableName } : app)));
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && newAppId.trim()) {
			e.preventDefault();
			handleAdd();
		}
	};

	return (
		<div className="space-y-4">
			<div>
				<Label className="text-sm font-medium mb-2 block">NextRows App IDs</Label>
				<p className="text-xs text-muted-foreground mb-3">
					Create apps in NextRows using the prompts above, then paste the app IDs here.
				</p>
			</div>

			{/* Existing apps list */}
			{apps.length > 0 && (
				<div className="space-y-2">
					{apps.map((app, index) => (
						<div
							key={app.id}
							className="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/30"
						>
							<div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
								<div>
									<span className="text-xs text-muted-foreground">App #{index + 1}</span>
									<code className="block text-sm font-mono mt-0.5">{app.appId}</code>
								</div>
								<div>
									<span className="text-xs text-muted-foreground">Table Name (optional)</span>
									<Input
										value={app.tableName}
										onChange={(e) => handleUpdateTableName(app.id, e.target.value)}
										placeholder={`${app.appId.toLowerCase().slice(0, 8)}`}
										className="h-7 text-sm mt-0.5"
										disabled={disabled}
									/>
								</div>
							</div>
							<Button
								type="button"
								variant="ghost"
								size="icon-sm"
								onClick={() => handleRemove(app.id)}
								disabled={disabled}
								className="text-muted-foreground hover:text-destructive"
							>
								<TrashIcon className="size-4" />
							</Button>
						</div>
					))}
				</div>
			)}

			{/* Add new app form */}
			<div className="flex flex-col sm:flex-row gap-2">
				<div className="flex-1">
					<Input
						value={newAppId}
						onChange={(e) => setNewAppId(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="Enter NextRows app ID (e.g., 0smoimgaw6)"
						disabled={disabled}
					/>
				</div>
				<div className="flex-1">
					<Input
						value={newTableName}
						onChange={(e) => setNewTableName(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="Custom table name (optional)"
						disabled={disabled}
					/>
				</div>
				<Button
					type="button"
					variant="outline"
					onClick={handleAdd}
					disabled={disabled || !newAppId.trim()}
				>
					<PlusIcon className="size-4 mr-1" />
					Add
				</Button>
			</div>

			{apps.length === 0 && (
				<p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
					No apps added yet. Add your first NextRows app ID above.
				</p>
			)}
		</div>
	);
}
