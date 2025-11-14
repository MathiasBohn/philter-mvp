"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import { AddressHistoryEntry } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export interface AddressHistoryListProps {
  addresses: AddressHistoryEntry[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onEdit?: (id: string) => void;
}

export function AddressHistoryList({ addresses, onAdd, onRemove }: AddressHistoryListProps) {
  const sortedAddresses = [...addresses].sort((a, b) => {
    if (a.isCurrent) return -1;
    if (b.isCurrent) return 1;
    return new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime();
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Address History (Last 2 Years Required)</h3>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Address
        </Button>
      </div>

      {sortedAddresses.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No addresses added yet. Please add at least 2 years of address history.
          </CardContent>
        </Card>
      )}

      {sortedAddresses.map((address) => (
        <Card key={address.id}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="font-medium">
                  {address.street}
                  {address.unit && `, ${address.unit}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {address.city}, {address.state} {address.zip}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(address.fromDate)} - {address.isCurrent ? "Present" : formatDate(address.toDate!)}
                  {address.isCurrent && <span className="ml-2 text-xs font-medium text-green-600">(Current)</span>}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onRemove(address.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
