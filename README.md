# Forsinka

### What does it do?
Forsinka is a web application that displays all delayed arrivals to Ski Stasjon. 
The app was mainly made as a learning opportunity in exploring ReactJS, GraphQL, and the EnTur API.

### How does it work? 
It uses the EnTur API to pull aimedArrivals, expectedArrivals, ID's, vehicle names and more. 
After all the data needed is pulled from the API it matches the aimedArrivals and expectedArrivals to see what arrivals were late. 
These late arrivals are then sent to a Mongoose database which stores all the data for later use. 
The data is then sent to the client where it is displayed on the page. 
Before it gets displayed it uses math to figure out how delayed the vehicle's arrival was, and parses the time of arrival into a more readable format. 
