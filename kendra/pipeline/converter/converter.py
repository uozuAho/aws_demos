"""
Downloaded from https://docs.aws.amazon.com/kendra/latest/dg/samples/converter.py.zip
"""

import argparse
import json
import boto3
import re
from collections import Counter


def main(bucket: str, filepath: str, meta_folder: str):
    """
    Obtain the Comprehend output and read it
    """
    # initialize an S3 environment
    s3 = boto3.client('s3')
    if meta_folder[-1] != "/":
        raise ValueError("meta_folder must end with a /")
    # get the output file
    comprehend_output = s3.get_object(Bucket=bucket, Key=filepath)
    # store the entire text as a string in variable "body"
    body = comprehend_output['Body'].read().decode("utf-8")
    # notify user of starting the process
    print("Converting...")

    """
    Split the Comprehend file and store it in an array
    """
    # create int array containing start indices of each JSON object
    split_locations = [word.start() for word in re.finditer('{"Entities"', body)]
    # initialize array to hold the split sections
    split_array = []
    # loop to split Comprehend text at desired indices
    for i in range(len(split_locations)):
        if i != len(split_locations) - 1:
            entry = body[split_locations[i]:split_locations[i+1]].strip("\n")
            split_array.append(entry)
        else:
            split_array.append(body[split_locations[i]:len(body)].strip("\n"))

    """
    Convert array elementwise into Kendra metadata and output
    """
    # initialize array
    kendra_array = []
    # loop over split elements to reformat individually
    for i in range(len(split_array)):
        # load each split element as JSON
        item = split_array[i]
        entity_json = json.loads(item)
        # initialize dictionary
        current_dictionary = dict()
        # store 'File' attribute to be used for renaming
        file_name = entity_json["File"]
        # loop to determine entity types present with high confidence score
        for entry in entity_json["Entities"]:
            if float(entry["Score"]) >= 0.9:
                current_dictionary[entry["Type"]] = []
        # loop to populate string lists of present entities for entry in entity_json["Entities"]:
            if float(entry["Score"]) >= 0.9:
                current_dictionary[entry["Type"]].append(entry["Text"])
        # pruning lists to keep 10 most common entities per category
        for key in current_dictionary:
            frequency_set = Counter(current_dictionary[key])
            max_10_frequencies = list(frequency_set.most_common(10))
            current_dictionary[key] = [x[0] for x in max_10_frequencies]
        # retrieve filename for required output format
        output_name = meta_folder + "data/" + file_name + ".metadata.json"
        # wrap contents in attributes tag
        file_content = '{"Attributes": ' + json.dumps(current_dictionary) + '}'
        # save file in desired format
        output = s3.put_object(Bucket=bucket, Key=output_name, Body=file_content)

    # notify user of completing the process
    print("Completed.")
    print("Your output JSON file(s) can be viewed at s3://" + bucket + "/" + meta_folder + "data/")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--bucket', required=True)
    parser.add_argument('--filepath', required=True, help='Filepath to the Comprehend output file')
    parser.add_argument('--meta_folder', required=True, help='Filepath to the metadata directory')
    args = parser.parse_args()
    main(args)
