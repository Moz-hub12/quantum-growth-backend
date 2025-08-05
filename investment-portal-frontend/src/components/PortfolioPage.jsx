import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Alert, AlertDescription } from './ui/alert'
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  PieChart, 
  BarChart3,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react'

const PortfolioPage = () => {
  const [holdings, setHoldings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchHoldings()
  }, [])

  const fetchHoldings = async () => {
    try {
      const response = await fetch('/api/plaid/holdings', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setHoldings(data)
        setError('')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch holdings data')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchHoldings()
  }

  const getSecurityInfo = (securityId) => {
    return holdings?.securities?.find(sec => sec.security_id === securityId) || {}
  }

  const calculateTotalValue = () => {
    if (!holdings?.holdings) return 0
    return holdings.holdings.reduce((total, holding) => total + (holding.institution_value || 0), 0)
  }

  const calculateGainLoss = (holding) => {
    const currentValue = holding.institution_value || 0
    const costBasis = holding.cost_basis || 0
    const quantity = holding.quantity || 0
    const totalCost = costBasis * quantity
    
    if (totalCost === 0) return { amount: 0, percentage: 0 }
    
    const gainLoss = currentValue - totalCost
    const percentage = (gainLoss / totalCost) * 100
    
    return { amount: gainLoss, percentage }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Loading your portfolio...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Portfolio Holdings</h1>
            <p className="text-gray-600 mt-2">
              Detailed view of your investment positions
            </p>
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!holdings?.holdings || holdings.holdings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <PieChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Holdings Found
              </h3>
              <p className="text-gray-600 mb-4">
                Connect your investment accounts to view your portfolio holdings.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Portfolio Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${calculateTotalValue().toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Holdings</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {holdings.holdings.length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Accounts</CardTitle>
                  <PieChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {holdings.accounts.length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Holdings Table */}
            <Card>
              <CardHeader>
                <CardTitle>Holdings Details</CardTitle>
                <CardDescription>
                  Individual security positions in your portfolio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Security</th>
                        <th className="text-right py-3 px-4 font-medium">Quantity</th>
                        <th className="text-right py-3 px-4 font-medium">Price</th>
                        <th className="text-right py-3 px-4 font-medium">Market Value</th>
                        <th className="text-right py-3 px-4 font-medium">Gain/Loss</th>
                      </tr>
                    </thead>
                    <tbody>
                      {holdings.holdings.map((holding, index) => {
                        const security = getSecurityInfo(holding.security_id)
                        const gainLoss = calculateGainLoss(holding)
                        const isPositive = gainLoss.amount >= 0

                        return (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {security.name || 'Unknown Security'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {security.ticker_symbol && (
                                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                                      {security.ticker_symbol}
                                    </span>
                                  )}
                                  <span className="ml-2 capitalize">{security.type}</span>
                                </div>
                              </div>
                            </td>
                            <td className="text-right py-4 px-4">
                              {holding.quantity?.toLocaleString()}
                            </td>
                            <td className="text-right py-4 px-4">
                              ${holding.institution_price?.toFixed(2)}
                            </td>
                            <td className="text-right py-4 px-4 font-medium">
                              ${holding.institution_value?.toLocaleString()}
                            </td>
                            <td className="text-right py-4 px-4">
                              <div className={`flex items-center justify-end ${
                                isPositive ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {isPositive ? (
                                  <TrendingUp className="w-4 h-4 mr-1" />
                                ) : (
                                  <TrendingDown className="w-4 h-4 mr-1" />
                                )}
                                <div>
                                  <div className="font-medium">
                                    {isPositive ? '+' : ''}${gainLoss.amount.toFixed(2)}
                                  </div>
                                  <div className="text-xs">
                                    {isPositive ? '+' : ''}{gainLoss.percentage.toFixed(2)}%
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Account Breakdown */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Account Breakdown</CardTitle>
                <CardDescription>
                  Holdings organized by account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {holdings.accounts.map((account) => {
                    const accountHoldings = holdings.holdings.filter(
                      h => h.account_id === account.account_id
                    )
                    const accountValue = accountHoldings.reduce(
                      (sum, h) => sum + (h.institution_value || 0), 0
                    )

                    return (
                      <div key={account.account_id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h3 className="font-semibold text-gray-900">{account.name}</h3>
                            <p className="text-sm text-gray-500 capitalize">
                              {account.type} • {account.subtype}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-lg">
                              ${accountValue.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              {accountHoldings.length} holdings
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {accountHoldings.map((holding, idx) => {
                            const security = getSecurityInfo(holding.security_id)
                            return (
                              <div key={idx} className="bg-gray-50 p-3 rounded">
                                <div className="font-medium text-sm">
                                  {security.ticker_symbol || security.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {holding.quantity} shares
                                </div>
                                <div className="font-semibold">
                                  ${holding.institution_value?.toLocaleString()}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

export default PortfolioPage

