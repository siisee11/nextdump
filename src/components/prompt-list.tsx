import { useState } from "react";
import { CheckCircleIcon, CopyIcon } from "@/components/icons";
import { type ExtractionPrompt, PromptCard } from "@/components/prompt-card";
import { Button } from "@/components/ui/button";

interface PromptListProps {
	prompts: ExtractionPrompt[];
}

export function PromptList({ prompts: initialPrompts }: PromptListProps) {
	const [prompts, setPrompts] = useState<ExtractionPrompt[]>(initialPrompts);
	const [copiedAll, setCopiedAll] = useState(false);

	const handleUpdatePrompt = (index: number, updatedPrompt: ExtractionPrompt) => {
		setPrompts((prev) => {
			const updated = [...prev];
			updated[index] = updatedPrompt;
			return updated;
		});
	};

	const handleCopyAll = async () => {
		try {
			const allPrompts = prompts.map((p) => p.extractPrompt).join("\n\n");
			await navigator.clipboard.writeText(allPrompts);
			setCopiedAll(true);
			setTimeout(() => setCopiedAll(false), 2000);
		} catch (err) {
			console.error("Failed to copy:", err);
		}
	};

	if (prompts.length === 0) {
		return (
			<div className="text-center py-8">
				<p className="text-muted-foreground">No extraction prompts were generated.</p>
				<p className="text-sm text-muted-foreground mt-1">
					The website may not have structured data suitable for extraction.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Header with copy all button */}
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-lg font-semibold">NextRows App Prompts</h3>
					<p className="text-sm text-muted-foreground">
						Use these prompts to create extraction apps in NextRows
					</p>
				</div>
				<Button variant="outline" size="sm" onClick={handleCopyAll} className="gap-2">
					{copiedAll ? (
						<>
							<CheckCircleIcon className="size-4 text-green-500" />
							Copied!
						</>
					) : (
						<>
							<CopyIcon className="size-4" />
							Copy All
						</>
					)}
				</Button>
			</div>

			{/* Instructions */}
			<div className="bg-muted/50 border rounded-lg p-4 text-sm">
				<p className="font-medium mb-2">How to use these prompts:</p>
				<ol className="list-decimal list-inside space-y-1 text-muted-foreground">
					<li>Copy a prompt using the copy button on each card</li>
					<li>Go to NextRows and create a new extraction app</li>
					<li>Paste the prompt and configure your app settings</li>
					<li>Save the app and copy the App ID for the next step</li>
				</ol>
			</div>

			{/* Prompt Cards */}
			<div className="grid gap-4">
				{prompts.map((prompt, index) => (
					<PromptCard
						key={prompt.pageUrl}
						prompt={prompt}
						index={index}
						onUpdate={handleUpdatePrompt}
					/>
				))}
			</div>
		</div>
	);
}
