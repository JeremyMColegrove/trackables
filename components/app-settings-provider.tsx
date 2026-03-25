"use client";

import { useQuery } from "@tanstack/react-query";
import { createContext, useContext } from "react";

type BillingEnabledResponse = {
	enabled: boolean;
};

type AppSettings = {
	subscriptionsEnabled: boolean;
	isLoading: boolean;
	isReady: boolean;
	refresh: () => Promise<void>;
};

const AppSettingsContext = createContext<AppSettings | null>(null);

async function fetchAppSettings() {
	const response = await fetch("/api/billing/enabled", {
		cache: "no-store",
	});

	if (!response.ok) {
		throw new Error("Failed to load application settings.");
	}

	const data = (await response.json()) as BillingEnabledResponse;

	return {
		subscriptionsEnabled: data.enabled,
	};
}

export function AppSettingsProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const settingsQuery = useQuery({
		queryKey: ["app-settings"],
		queryFn: fetchAppSettings,
		staleTime: 60_000,
	});

	return (
		<AppSettingsContext.Provider
			value={{
				subscriptionsEnabled:
					settingsQuery.data?.subscriptionsEnabled ?? false,
				isLoading: settingsQuery.isLoading,
				isReady: settingsQuery.isFetched,
				refresh: async () => {
					await settingsQuery.refetch();
				},
			}}
		>
			{children}
		</AppSettingsContext.Provider>
	);
}

export function useAppSettings() {
	const context = useContext(AppSettingsContext);

	if (!context) {
		throw new Error(
			"useAppSettings must be used within an AppSettingsProvider.",
		);
	}

	return context;
}
