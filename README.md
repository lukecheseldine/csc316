# Student Spending Comparison

## Overview

This web application provides an interactive visualization of student spending patterns. It allows users to compare their personal expenditures against aggregated student spending data across various categories such as housing, food, entertainment, and more. Users can filter the visualization by demographic factors to gain insights into spending habits among different student populations.

## Features

-   Interactive Radar Chart Visualization: Displays spending patterns across multiple categories
-   Personal Spending Comparison: Input your own spending data to compare against student averages
-   Demographic Filtering: Filter visualizations by:
    -   Gender
    -   Income level
    -   Academic year
    -   Major/field of study
-   Toggle Average View: Switch between individual data points and aggregated averages
-   Responsive Design: Optimized for both desktop and mobile viewing
-   Data Persistence: User-entered spending data is saved locally between sessions

Optimized for 1050px x 900px window size

## Video Demo

[Watch our application demo video](https://drive.google.com/file/d/1NDOyBNh5qd2R1bdRGKpSUlheJePSROrk/view?usp=sharing)

## Technology Stack

### Libraries & Frameworks

-   **D3.js (v7)**: Used for creating all data visualizations including box plots, radar charts, and bar charts
-   **Bootstrap (v5.3)**: Provides the responsive layout and UI components
-   **JavaScript**: Core programming language for application logic

### Custom Code

-   **Visualization Classes**: All visualization implementations (Box Plot, Radar, Gender, Major, etc.)
-   **Data Processing Logic**: Functions for filtering, aggregating, and analyzing student spending data
-   **UI Interactions**: Custom animations and event handling for an interactive experience
-   **Custom CSS**: Additional styling beyond Bootstrap's defaults

## Non-Obvious Features

1. **Data Filtering Logic**: The visualizations update dynamically when applying multiple filters simultaneously, with appropriate handling for empty data sets.

2. **Animated Transitions**: The application includes smooth animations when transitioning between different views or updating data, enhancing the user experience.

3. **Local Storage Use**: The application stores user spending data in local storage, allowing for persistence between pages without requiring a backend.

4. **Responsive Visualizations**: All charts automatically resize based on the container dimensions, optimizing for different screen sizes.

5. **Custom Hover Effects**: Most charts include interactive hover states that provide additional information or highlight specific data points.

6. **Drag and Zoom Controls**: The radar visualization supports mouse drag and zoom functionality for detailed exploration.
