
'use client';

import React from 'react';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import { ControllerRenderProps } from 'react-hook-form';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';

interface LocationAutocompleteProps {
  field: ControllerRenderProps<any, 'location'>;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({ field }) => {
  const [apiKey, setApiKey] = React.useState<string | undefined>(undefined);
  const instanceId = React.useId();

  React.useEffect(() => {
    // We need to access process.env on the client, so we do it in useEffect
    setApiKey(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
  }, []);


  if (apiKey === undefined) {
    // Still loading the key
    return <Input placeholder="Loading map..." disabled />;
  }

  if (!apiKey) {
    console.error("Google Maps API Key is missing. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file.");
    return <Input placeholder="Google Maps API Key is missing..." disabled />;
  }
  
  const handleSelect = (place: any) => {
    field.onChange(place?.label || '');
  };

  return (
    <GooglePlacesAutocomplete
      apiKey={apiKey}
      apiOptions={{
        language: 'en',
        region: 'us'
      }}
      selectProps={{
        value: field.value ? { label: field.value, value: field.value } : null,
        onChange: handleSelect,
        placeholder: 'Start typing an address...',
        instanceId: instanceId, // To avoid duplicate ID warnings
        classNames: {
            control: (state) => cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                // This is a workaround to mimic focus-visible for this component
                (state.isFocused || state.menuIsOpen) && "ring-2 ring-ring ring-offset-2"
            ),
            input: () => "text-base md:text-sm",
            menu: () => "mt-1 rounded-md border bg-popover text-popover-foreground shadow-md z-10",
            option: (state) => cn(
                "cursor-default select-none relative py-2 pl-8 pr-4 text-sm outline-none",
                state.isFocused && "bg-accent text-accent-foreground rounded-sm"
            )
        },
      }}
    />
  );
};
