"use client";

import { useTrackableDetails } from "./trackable-shell";
import { FormBuilder } from "./form-builder";
import {
	TrackablePageFrame,
	TrackableNarrowContent,
	TrackableSectionHeader,
	UnsupportedPageState,
} from "./components/trackable-page-frame";

export function TrackableFormSection() {
	const trackable = useTrackableDetails();

	return (
		<TrackablePageFrame
			eyebrow="Current trackable"
			title="Form"
			description="Build and update the public survey form shown to respondents."
		>
			{trackable.kind !== "survey" ? (
				<UnsupportedPageState
					title="Form builder unavailable"
					description="Only survey trackables have a form builder."
				/>
			) : (
				<TrackableNarrowContent>
					<TrackableSectionHeader
						title="Form"
						description="Build and update the public form people use to submit responses."
					/>
					<FormBuilder
						key={trackable.activeForm?.id ?? "empty-form"}
						trackableId={trackable.id}
						trackableName={trackable.name}
						trackableDescription={trackable.description}
						activeForm={trackable.activeForm}
					/>
				</TrackableNarrowContent>
			)}
		</TrackablePageFrame>
	);
}
