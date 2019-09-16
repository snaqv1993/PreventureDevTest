# PreventureDevTest

This is a development test for Preventure

Steps to run:

1. Ensure node and npm are installed on the machine
2. Clone the Repo
3. Open Command prompt and move to the local directory where repository has been cloned. Make sure you are into the folder where index.js is located.
4. Run either "nodemon index.js" or "node index.js"

URLS

1. localhost:3000/station/{id} Description: This enables us to filter the dataset by From Station which will then display the following stats: *The most common destination from this station. *The prevalent age group of users at this station. Separate the users in buckets of 0-15, 16-30, 31-45, 46+ Amount of revenue generated by this station. *Amount of revenue generated by this station.

2. localhost:3000/topstations Description: This gives us the top three revenue generating stations.

3. localhost:3000/repairbikes Description: this lists bike ids that need repair work

Assumptions:

1. For a trip, the revenue(trip duration * 0.10) is counted against the departure station.
2. Age is calculated as current year i.e. 2019 - birthyear
