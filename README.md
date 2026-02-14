# BlackJack Web App
BlackJack card game clone web application

## Overview
This web application is a clone of the popular card game Blackjack, written in JavaScript &amp; C# using the ASP.NET Core framework &amp; its SignalR library.

This expands on the console application I made a number of years ago whose repository is located [here](https://github.com/jaydenmuzzin/blackjack).

It is a simulation of the basic form of the game, allowing multiple players to compete against each other and a dealer through "hitting" & "standing", chat to each other, and to change their settings to enhance their experience.

Additional features are planned for the future.

## License
Please acknowledge the license of this software outlined in the "LICENSE.md" file located in the root of this repository.

## Requirements
For this web application to run, .NET 9.0 is required to be installed on your machine. The installation process varies between the Windows, MacOS and Linux platforms. To install .NET for your machine, please refer to the information provided [here](https://learn.microsoft.com/en-us/dotnet/core/install/).

To use this application, please follow the steps outlined in the 'Using the application' section below.

I have also included the Visual Studio solution file (.sln) in this repository which you can use to view (and modify) the code and its structure more easily. To open this file, you will need to have Microsoft Visual Studio installed on your machine, which you can download [here](https://visualstudio.microsoft.com/downloads/).

## Using the application
To use the application:
  1. Install the latest .NET 9.0 version on your machine, which can be obtained [here](https://dotnet.microsoft.com/en-us/download/dotnet/9.0) (Windows users should only need the ASP.NET Core Runtime. MacOS users will need the SDK which includes the ASP.NET Core Runtime.)
  2. Ensure the active branch of this repository is 'master'
  3. Click the 'Clone or download' dropdown
  4. Click 'Download ZIP'
  5. Download the repo to your chosen destination
  6. Extract the contents of the file to your chosen destination
  7. Navigate to the 'blackjack-web-app\BlackJack\bin\Release\net9.0' directory (This directory can be renamed and moved to another location if desired)
  8. Launch the 'Blackjack.exe' executable file
  9. Navigate to http://localhost:5000/ in your web browser
  10. When done, close the terminal where the application is running, or press Ctrl+C to terminate the process

To enable multiplayer:
  1. Navigate to the 'Game' page in the running application
  2. Duplicate the browser tab, or navigate to the 'Game' page in any number of additional browser tabs or windows
  3. Enter a username for each player in each game session (browser tab / window) (Every time a player is registered, their username will appear in each session)
  4. When all players are ready, press 'Start' to begin, where the player order will be that in which each player was registered
  
## Planned features
  - Betting game mechanic
  - "Splitting", "Doubling down" and "Insurance" game mechanics
  - Additional settings:
    - Theme & card style modification
    - Displaying other players' hands
    - Number of decks used
  - Improved multiplayer experience