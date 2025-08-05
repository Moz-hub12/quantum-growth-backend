import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Alert, AlertDescription } from './ui/alert'
import { 
  Activity,
  Calendar,
  DollarSign,
  Filter,
  Download,
  Loader2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw
} from 'lucide-react'

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [dateRange, setDateRange] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const params = new URLSearchParams(dateRange)
      const response = await fetch(`/api/plaid/transactions?${params}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setTransactions(data)
        setError('')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch transactions')
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
    fetchTransactions()
  }

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const applyDateFilter = () => {
    setLoading(true)
    fetchTransactions()
  }

  const getSecurityInfo = (securityId) => {
    return transactions?.securities?.find(sec => sec.security_id === securityId) || {}
  }

  const getTransactionIcon = (type, subtype) => {
    if (type === 'buy' || subtype === 'buy') {
      return <ArrowDownLeft className="w-4 h-4 text-red-600" />
    } else if (type === 'sell' || subtype === 'sell') {
      return <ArrowUpRight className="w-4 h-4 text-green-600" />
    } else {
      return <Activity className="w-4 h-4 text-blue-600" />
    }
  }

  const getTransactionColor = (type, subtype) => {
    if (type === 'buy' || subtype === 'buy') {
      return 'text-red-600'
    } else if (type === 'sell' || subtype === 'sell') {
      return 'text-green-600'
    } else {
      return 'text-blue-600'
    }
  }

  const formatTransactionType = (type, subtype) => {
    if (subtype) {
      return subtype.charAt(0).toUpperCase() + subtype.slice(1)
    }
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  const calculateTotalValue = () => {
    if (!transactions?.transactions) return 0
    return transactions.transactions.reduce((total, tx) => total + Math.abs(tx.amount || 0), 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Loading transactions...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
            <p className="text-gray-600 mt-2">
              View and analyze your investment transactions
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </Button>
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
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={dateRange.start_date}
                  onChange={(e) => handleDateRangeChange('start_date', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <Input
                  type="date"
                  value={dateRange.end_date}
                  onChange={(e) => handleDateRangeChange('end_date', e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={applyDateFilter} className="w-full">
                  Apply Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {transactions?.transactions?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
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
              <CardTitle className="text-sm font-medium">Date Range</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {new Date(dateRange.start_date).toLocaleDateString()} - {new Date(dateRange.end_date).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        {!transactions?.transactions || transactions.transactions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Transactions Found
              </h3>
              <p className="text-gray-600 mb-4">
                No transactions found for the selected date range.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Transaction Details</CardTitle>
              <CardDescription>
                Complete history of your investment transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Date</th>
                      <th className="text-left py-3 px-4 font-medium">Security</th>
                      <th className="text-left py-3 px-4 font-medium">Type</th>
                      <th className="text-right py-3 px-4 font-medium">Quantity</th>
                      <th className="text-right py-3 px-4 font-medium">Price</th>
                      <th className="text-right py-3 px-4 font-medium">Amount</th>
                      <th className="text-right py-3 px-4 font-medium">Fees</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.transactions.map((transaction, index) => {
                      const security = getSecurityInfo(transaction.security_id)
                      const transactionColor = getTransactionColor(transaction.type, transaction.subtype)

                      return (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="text-sm">
                              {new Date(transaction.date).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-gray-900">
                                {security.name || transaction.name || 'Cash Transaction'}
                              </div>
                              {security.ticker_symbol && (
                                <div className="text-sm text-gray-500">
                                  <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                                    {security.ticker_symbol}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className={`flex items-center space-x-2 ${transactionColor}`}>
                              {getTransactionIcon(transaction.type, transaction.subtype)}
                              <span className="capitalize">
                                {formatTransactionType(transaction.type, transaction.subtype)}
                              </span>
                            </div>
                          </td>
                          <td className="text-right py-4 px-4">
                            {transaction.quantity ? transaction.quantity.toLocaleString() : '-'}
                          </td>
                          <td className="text-right py-4 px-4">
                            {transaction.price ? `$${transaction.price.toFixed(2)}` : '-'}
                          </td>
                          <td className={`text-right py-4 px-4 font-medium ${transactionColor}`}>
                            ${Math.abs(transaction.amount || 0).toLocaleString()}
                          </td>
                          <td className="text-right py-4 px-4 text-gray-500">
                            ${(transaction.fees || 0).toFixed(2)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default TransactionsPage

