import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Alert, AlertDescription } from './ui/alert'
import { 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Link as LinkIcon,
  AlertCircle
} from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()
  const [portfolioData, setPortfolioData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    checkConnectionStatus()
  }, [])

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch('/api/plaid/status', {
        credentials: 'include'
      })
      const data = await response.json()
      setIsConnected(data.connected)
      
      if (data.connected) {
        fetchPortfolioSummary()
      } else {
        setLoading(false)
      }
    } catch (error) {
      console.error('Error checking connection status:', error)
      setLoading(false)
    }
  }

  const fetchPortfolioSummary = async () => {
    try {
      const response = await fetch('/api/plaid/portfolio_summary', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setPortfolioData(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch portfolio data')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const connectAccount = async () => {
    try {
      // Create link token
      const response = await fetch('/api/plaid/create_link_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ user_id: user?.id || 'default' }),
      })

      const data = await response.json()
      
      if (response.ok) {
        // In a real implementation, you would use Plaid Link here
        // For demo purposes, we'll show a message
        alert('Plaid Link integration would open here. This requires Plaid API credentials.')
      } else {
        setError(data.error || 'Failed to create link token')
      }
    } catch (error) {
      setError('Network error occurred')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's an overview of your investment portfolio
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!isConnected ? (
          /* Connection Required */
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <LinkIcon className="w-5 h-5 mr-2" />
                Connect Your Investment Account
              </CardTitle>
              <CardDescription>
                Securely connect your investment accounts to view your portfolio data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LinkIcon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Accounts Connected
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Connect your investment accounts using our secure, bank-level integration 
                  to start tracking your portfolio performance.
                </p>
                <Button onClick={connectAccount} className="mb-4">
                  Connect Account
                </Button>
                <div className="text-xs text-gray-500">
                  <p>🔒 Your data is encrypted and secure</p>
                  <p>We never store your banking credentials</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Portfolio Dashboard */
          <>
            {/* Portfolio Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="card-hover">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${portfolioData?.total_value?.toLocaleString() || '0'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600 flex items-center">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      +2.5% from last month
                    </span>
                  </p>
                </CardContent>
              </Card>

              <Card className="card-hover">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Object.keys(portfolioData?.account_balances || {}).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Connected investment accounts
                  </p>
                </CardContent>
              </Card>

              <Card className="card-hover">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Asset Classes</CardTitle>
                  <PieChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Object.keys(portfolioData?.asset_allocation || {}).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Diversified portfolio
                  </p>
                </CardContent>
              </Card>

              <Card className="card-hover">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Performance</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">+8.2%</div>
                  <p className="text-xs text-muted-foreground">
                    Year-to-date return
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Asset Allocation */}
            {portfolioData?.asset_allocation && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Asset Allocation</CardTitle>
                    <CardDescription>
                      Your portfolio distribution by asset type
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(portfolioData.asset_allocation).map(([type, data]) => (
                        <div key={type} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-primary rounded-full"></div>
                            <span className="capitalize font-medium">{type}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              ${data.value?.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              {data.percentage?.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Account Balances</CardTitle>
                    <CardDescription>
                      Individual account values
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(portfolioData?.account_balances || {}).map(([id, account]) => (
                        <div key={id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium">{account.name}</div>
                            <div className="text-sm text-gray-500">Account ID: {id.slice(-8)}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              ${account.balance?.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Manage your portfolio and account settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                    <PieChart className="w-6 h-6" />
                    <span>View Portfolio</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                    <Activity className="w-6 h-6" />
                    <span>Transaction History</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                    <TrendingUp className="w-6 h-6" />
                    <span>Performance Report</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

export default Dashboard

