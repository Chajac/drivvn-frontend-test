# drivvn-frontend-tech

This repository contains the code related to the Drivvn front end test. A deployed version can be found [here](https://app.netlify.com/sites/snap-drivvn/overview). 

### Running locally

1. Clone repo ```git clone https://github.com/chajac/drivvn-frontend-tech.git```
2. Navigate to project root
3. Install dependencies with the following command: ```npm install```
4. Start development server with ```npm run dev```
5. Navigate to the associated localhost link - defaults to [localhost:5174](http://localhost:5173/)

## Scripts

### Development

To start the development server, run:

```npm run dev```

This will start Vite in development mode.

### Building

To build the project for production, run:
```npm run build```
This command will transpile TypeScript files using `tsc` and then bundle the project using Vite.

### Linting

To lint the project, run:
```npm run lint```
This command will run ESLint to check for linting errors in TypeScript and React files.

### Preview

To preview the production build locally, run:
```npm run preview```
This command will serve the production build locally using Vite.

### Testing

To run tests, run:
```npm test```
Or to execute the tests in watch mode:
```npm run test:watch```

## Notes

- This project uses TypeScript for type safety.
- Development server is powered by Vite.
- ESLint is used for linting TypeScript and React files.
- Jest is used for testing.

