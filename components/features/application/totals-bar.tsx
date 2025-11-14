"use client"

import { Card } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface TotalsBarProps {
  assets: number
  liabilities: number
  monthlyIncome: number
  monthlyExpenses: number
}

export function TotalsBar({
  assets,
  liabilities,
  monthlyIncome,
  monthlyExpenses,
}: TotalsBarProps) {
  const netWorth = assets - liabilities
  const dti = monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) * 100 : 0

  const getDTIStatus = (dti: number) => {
    if (dti <= 30) return { color: "text-green-600", label: "Excellent" }
    if (dti <= 43) return { color: "text-yellow-600", label: "Good" }
    return { color: "text-destructive", label: "High" }
  }

  const dtiStatus = getDTIStatus(dti)

  return (
    <Card className="p-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Total Assets</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(assets)}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            Total Liabilities
          </p>
          <p className="text-2xl font-bold text-destructive">
            {formatCurrency(liabilities)}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Net Worth</p>
          <p
            className={`text-2xl font-bold ${
              netWorth >= 0 ? "text-green-600" : "text-destructive"
            }`}
          >
            {formatCurrency(netWorth)}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            Debt-to-Income Ratio
          </p>
          <div className="flex items-baseline gap-2">
            <p className={`text-2xl font-bold ${dtiStatus.color}`}>
              {dti.toFixed(1)}%
            </p>
            <span className={`text-sm ${dtiStatus.color}`}>
              {dtiStatus.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Monthly Expenses / Monthly Income
          </p>
        </div>
      </div>
    </Card>
  )
}
