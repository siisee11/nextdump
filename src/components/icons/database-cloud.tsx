import type { SVGProps } from "react";

export function DatabaseCloudIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="120"
			height="120"
			viewBox="0 0 120 120"
			fill="none"
			{...props}
		>
			{/* Database cylinder */}
			<ellipse cx="60" cy="22" rx="32" ry="10" fill="#6B8FAD" stroke="#1a1a1a" strokeWidth="3" />
			<path
				d="M28 22v40c0 5.5 14.3 10 32 10s32-4.5 32-10V22"
				fill="white"
				stroke="#1a1a1a"
				strokeWidth="3"
			/>
			<path d="M28 42c0 5.5 14.3 10 32 10s32-4.5 32-10" stroke="#1a1a1a" strokeWidth="3" />
			<path d="M28 62c0 5.5 14.3 10 32 10s32-4.5 32-10" stroke="#1a1a1a" strokeWidth="3" />

			{/* Arrow pointing down */}
			<path d="M60 55v30" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
			<path
				d="M52 77l8 8 8-8"
				stroke="#1a1a1a"
				strokeWidth="3"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>

			{/* Cloud */}
			<path
				d="M40 105c-8 0-14-6-14-13 0-6 4-11 10-12.5-.5-1.5-.5-3-.5-4.5 0-8 6.5-14 14.5-14 6 0 11 3.5 13.5 8.5 2-1.5 4.5-2.5 7.5-2.5 7 0 13 6 13 13 0 .5 0 1-.1 1.5 5.1 1.5 8.6 6 8.6 11.5 0 6.5-5.5 12-12.5 12H40z"
				fill="white"
				stroke="#1a1a1a"
				strokeWidth="3"
			/>
		</svg>
	);
}
