# Mobile Data Marketplace  WebApp
Mobile Data Marketplace a WebApp which allows the commercialization of personal data relating to the position coordinates of an user. The WebApp exposes sign-up and login APIs.
Based on the use of the Spring Boot framework, which offers a set of REST access points aimed at allowing the saving and access to sequences of geographical locations of individual users, according to the following requirements: User authentication is managed through the use of Spring Security and theOAuth2 protocol by appropriately configuring the endpoints needed to request an access token based on JWT (JSON Web Token)


Defined three different roles for the control access: ADMIN, USER, CUSTOMER. Users with the ADMIN role can access all data stored by USERS and CUSTOMERS. Users with the USER role can save and later retrieve their data. Users with the CUSTOMER role can retrieve the number of positions present in an area delimited by a polygon in a given time interval, and subsequently decide whether or not to purchase the positions by recording the transaction;


if this happens it will be necessary to attribute to the users who have provided the individual data a fraction of the price paid proportional to the amount of data actually purchased (as part of the logic, the transaction is simulated and no money exchange takes place)

Each user has a personal profile page where he can recharges its personal wallet.

Used MongoDB to save data and perform geographic queries to determine the locations belonging to a given area.

Packaged the application using maven and create a Docker container to host it.

## Details
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.0.7.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
