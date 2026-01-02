import { useState } from "react";
import { CheckCircleIcon, CopyIcon, PencilIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export interface ExtractionPrompt {
	pageUrl: string;
	extractPrompt: string;
}

interface PromptCardProps {
	prompt: ExtractionPrompt;
	index: number;
	onUpdate?: (index: number, updatedPrompt: ExtractionPrompt) => void;
}

export function PromptCard({ prompt, index, onUpdate }: PromptCardProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [editedPrompt, setEditedPrompt] = useState(prompt.extractPrompt);
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(prompt.extractPrompt);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy:", err);
		}
	};

	const handleEdit = () => {
		setIsEditing(true);
		setEditedPrompt(prompt.extractPrompt);
	};

	const handleSave = () => {
		onUpdate?.(index, { ...prompt, extractPrompt: editedPrompt });
		setIsEditing(false);
	};

	const handleCancel = () => {
		setEditedPrompt(prompt.extractPrompt);
		setIsEditing(false);
	};

	return (
		<Card className="relative">
			<CardHeader className="pb-2">
				<div className="flex items-start justify-between gap-2">
					<CardTitle className="text-sm font-medium text-muted-foreground">
						Prompt {index + 1}
					</CardTitle>
					<div className="flex gap-1">
						{!isEditing && (
							<>
								<Button
									variant="ghost"
									size="sm"
									onClick={handleCopy}
									className="h-8 w-8 p-0"
									title="Copy to clipboard"
								>
									{copied ? (
										<CheckCircleIcon className="size-4 text-green-500" />
									) : (
										<CopyIcon className="size-4" />
									)}
								</Button>
								<Button
									variant="ghost"
									size="sm"
									onClick={handleEdit}
									className="h-8 w-8 p-0"
									title="Edit prompt"
								>
									<PencilIcon className="size-4" />
								</Button>
							</>
						)}
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-3">
				{/* Target URL */}
				<div>
					<p className="text-xs text-muted-foreground mb-1">Target URL Pattern</p>
					<a
						href={prompt.pageUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="text-sm text-primary hover:underline break-all"
					>
						{prompt.pageUrl}
					</a>
				</div>

				{/* Extraction Prompt */}
				<div>
					<p className="text-xs text-muted-foreground mb-1">Extraction Prompt</p>
					{isEditing ? (
						<div className="space-y-2">
							<Textarea
								value={editedPrompt}
								onChange={(e) => setEditedPrompt(e.target.value)}
								className="text-sm min-h-[80px] font-mono"
								placeholder="Enter extraction prompt..."
							/>
							<div className="flex gap-2 justify-end">
								<Button variant="outline" size="sm" onClick={handleCancel}>
									Cancel
								</Button>
								<Button size="sm" onClick={handleSave}>
									Save
								</Button>
							</div>
						</div>
					) : (
						<pre className="text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap font-mono">
							{prompt.extractPrompt}
						</pre>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
