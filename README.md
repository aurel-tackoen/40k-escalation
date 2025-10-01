# Warhammer 40k Escalation League Manager

A comprehensive web application for managing Warhammer 40k escalation leagues, built with Vue.js and Tailwind CSS.

## Features

### 🏆 League Management
- Create and configure escalation leagues with customizable parameters
- Define point limits per round (e.g., 500pts → 1000pts → 2000pts)
- Set league duration and track round progression
- Export/import league data for backup and sharing

### 👥 Player Registration
- Add players with their chosen faction
- Track comprehensive player statistics
- View win/loss/draw records and total victory points
- Remove players with confirmation dialogs

### ⚔️ Match Recording
- Record game results between players
- Capture victory points for primary and secondary objectives
- Support for different mission types and rounds
- Add detailed match notes and track game history

### 📊 Standings & Analytics
- Real-time leaderboard based on wins and victory points
- Head-to-head records between players
- Round-by-round performance tracking
- Visual win percentage indicators

## Technology Stack

- **Frontend:** Vue.js 3 with Composition API
- **Styling:** Tailwind CSS with custom Warhammer 40k theme
- **Build Tool:** Vite
- **Package Manager:** npm

## Getting Started

### Prerequisites
- Node.js 20.19+ or 22.12+ (current version has warnings but works)
- npm 10+

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd 40k-escalation
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built application will be in the `dist/` directory.

## Usage

### Setting Up a League

1. Navigate to the **League Setup** tab
2. Configure your league name, description, and dates
3. Set up rounds with point limits and timeframes
4. Save your configuration

### Adding Players

1. Go to the **Players** tab
2. Fill in player details including name and faction
3. Players will appear in the roster with initial stats

### Recording Matches

1. Switch to the **Matches** tab
2. Select the two players for the match
3. Enter victory points for each player
4. Choose the round, mission, and date
5. Select the winner or mark as a draw
6. Add optional match notes

### Viewing Results

The **Dashboard** provides:
- Current league overview
- Live standings table
- Recent match results
- Round information

## Game Rules Integration

The application supports standard Warhammer 40k 10th Edition rules:
- Victory Points system (0-45 points typical)
- Various mission types
- Progressive army building through rounds
- Win/Loss/Draw tracking

## Data Management

- **Export:** Download league data as JSON for backup
- **Import:** Upload previously exported league data
- **Local Storage:** Data persists in browser localStorage

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues, feature requests, or questions, please create an issue in the repository.

---

*For the Emperor! ⚔️*
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```
