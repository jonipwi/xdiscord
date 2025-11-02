# Sample Graph Data Files

This directory contains sample data files that can be used to test the graph creation feature in the chat application.

## Files

### sample_graph_data.csv

A CSV file containing sample fruit sales data with the following columns:

- `name`: The name/label for each data point
- `value`: The numeric value for each data point

### sample_graph_data.xlsx

An Excel file containing the same data as the CSV file, demonstrating that both file formats are supported.

## Usage

1. In the chat application, click the graph button (📊) in the input area
2. Select "Upload File" mode
3. Choose either the CSV or Excel file
4. The graph will be automatically created with the data from the file
5. The graph title will be set to the filename (without extension) if no title is provided

## Data Format Requirements

For your own data files, ensure they have:

- A `name` column (text labels)
- A `value` column (numeric values)
- Headers in the first row (for CSV) or first row (for Excel)

The application will automatically filter out any rows with missing or invalid data.