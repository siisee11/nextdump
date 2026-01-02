import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LivePreviewProps {
	liveViewUrl: string;
	onDisconnect?: () => void;
}

export function LivePreview({ liveViewUrl, onDisconnect }: LivePreviewProps) {
	const [isDisconnected, setIsDisconnected] = useState(false);

	useEffect(() => {
		function handleMessage(event: MessageEvent) {
			if (event.data === "browserbase-disconnected") {
				setIsDisconnected(true);
				onDisconnect?.();
			}
		}

		window.addEventListener("message", handleMessage);
		return () => window.removeEventListener("message", handleMessage);
	}, [onDisconnect]);

	if (isDisconnected) {
		return (
			<Card className="border-muted">
				<CardContent className="py-8">
					<div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
						<p className="text-sm">Browser session ended</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-base">
					<span className="relative flex h-2 w-2">
						<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
						<span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
					</span>
					Live Browser View
				</CardTitle>
			</CardHeader>
			<CardContent className="p-0">
				<iframe
					src={liveViewUrl}
					sandbox="allow-same-origin allow-scripts"
					allow="clipboard-read; clipboard-write"
					title="Browserbase Live View"
					className="w-full h-[500px] rounded-b-lg border-t"
				/>
			</CardContent>
		</Card>
	);
}
