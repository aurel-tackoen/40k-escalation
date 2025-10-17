/**
 * Composable for data export utilities
 * Provides functions to export data to various formats
 */
export function useDataExport() {
  /**
   * Convert array of objects to CSV string
   * @param {Array<Object>} data - Array of objects to convert
   * @param {Array<string>} columns - Column names (object keys) to include
   * @returns {string} CSV string
   */
  const convertToCSV = (data, columns = null) => {
    if (!data || data.length === 0) return ''

    // If no columns specified, use keys from first object
    const headers = columns || Object.keys(data[0])

    // Create header row
    const headerRow = headers.join(',')

    // Create data rows
    const dataRows = data.map(item => {
      return headers.map(header => {
        const value = item[header]

        // Handle null/undefined
        if (value === null || value === undefined) return ''

        // Escape values containing commas or quotes
        const stringValue = String(value)
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }

        return stringValue
      }).join(',')
    })

    return [headerRow, ...dataRows].join('\n')
  }

  /**
   * Download data as CSV file
   * @param {Array<Object>} data - Data to export
   * @param {string} filename - Filename (without extension)
   * @param {Array<string>} columns - Columns to include
   */
  const downloadCSV = (data, filename = 'export', columns = null) => {
    const csv = convertToCSV(data, columns)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Clean up
    URL.revokeObjectURL(url)
  }

  /**
   * Download data as JSON file
   * @param {any} data - Data to export
   * @param {string} filename - Filename (without extension)
   * @param {boolean} pretty - Pretty print JSON
   */
  const downloadJSON = (data, filename = 'export', pretty = true) => {
    const json = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data)
    const blob = new Blob([json], { type: 'application/json' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.json`)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Clean up
    URL.revokeObjectURL(url)
  }

  /**
   * Copy data to clipboard as JSON
   * @param {any} data - Data to copy
   * @param {boolean} pretty - Pretty print JSON
   * @returns {Promise<boolean>} True if successful
   */
  const copyToClipboard = async (data, pretty = true) => {
    try {
      const json = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data)
      await navigator.clipboard.writeText(json)
      return true
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      return false
    }
  }

  /**
   * Format data for export with custom transformations
   * @param {Array<Object>} data - Source data
   * @param {Object} columnMap - Map of output column names to transformation functions
   * @returns {Array<Object>} Formatted data
   */
  const formatForExport = (data, columnMap) => {
    if (!data || !columnMap) return data

    return data.map(item => {
      const formattedItem = {}

      Object.entries(columnMap).forEach(([outputColumn, transform]) => {
        if (typeof transform === 'function') {
          formattedItem[outputColumn] = transform(item)
        } else if (typeof transform === 'string') {
          // If transform is a string, use it as a field name
          formattedItem[outputColumn] = item[transform]
        }
      })

      return formattedItem
    })
  }

  /**
   * Export player statistics to CSV
   * @param {Array<Object>} players - Players array
   * @param {string} filename - Filename
   */
  const exportPlayerStats = (players, filename = 'player-stats') => {
    const columns = ['name', 'faction', 'wins', 'losses', 'draws', 'points']
    downloadCSV(players, filename, columns)
  }

  /**
   * Export match history to CSV (supports all match types)
   * @param {Array<Object>} matches - Matches array
   * @param {string} filename - Filename
   */
  const exportMatchHistory = (matches, filename = 'match-history') => {
    const formattedMatches = matches.map(match => {
      const base = {
        date: match.datePlayed ? new Date(match.datePlayed).toLocaleDateString() : new Date(match.date).toLocaleDateString(),
        round: match.round,
        player1: match.player1Name || match.player1Id,
        player2: match.player2Name || match.player2Id,
        mission: match.mission || '',
        matchType: match.matchType || 'victory_points'
      }

      // Add match type-specific fields
      const matchType = match.matchType || 'victory_points'

      switch (matchType) {
        case 'victory_points':
          return {
            ...base,
            player1_vp: match.player1Points || 0,
            player2_vp: match.player2Points || 0,
            winner: match.winnerName || match.winnerId || 'Draw',
            notes: match.notes || ''
          }

        case 'percentage':
          return {
            ...base,
            player1_army_value: match.player1ArmyValue || 0,
            player2_army_value: match.player2ArmyValue || 0,
            player1_casualties: match.player1CasualtiesValue || 0,
            player2_casualties: match.player2CasualtiesValue || 0,
            margin_of_victory: match.marginOfVictory || '',
            winner: match.winnerName || match.winnerId || 'Draw',
            notes: match.notes || ''
          }

        case 'scenario':
          return {
            ...base,
            scenario_objective: match.scenarioObjective || '',
            player1_objective_completed: match.player1ObjectiveCompleted ? 'Yes' : 'No',
            player2_objective_completed: match.player2ObjectiveCompleted ? 'Yes' : 'No',
            player1_casualties: match.player1Points || 0,
            player2_casualties: match.player2Points || 0,
            winner: match.winnerName || match.winnerId || 'Draw',
            notes: match.notes || ''
          }

        default:
          return {
            ...base,
            player1_points: match.player1Points || 0,
            player2_points: match.player2Points || 0,
            winner: match.winnerName || match.winnerId || 'Draw',
            notes: match.notes || ''
          }
      }
    })

    downloadCSV(formattedMatches, filename)
  }

  return {
    convertToCSV,
    downloadCSV,
    downloadJSON,
    copyToClipboard,
    formatForExport,
    exportPlayerStats,
    exportMatchHistory
  }
}
