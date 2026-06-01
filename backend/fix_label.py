import os

labels_path = "DATASET/labels"

for root, dirs, files in os.walk(labels_path):

    for file in files:

        if file.endswith(".txt"):

            file_path = os.path.join(root, file)

            new_lines = []

            with open(file_path, "r") as f:

                lines = f.readlines()

            for line in lines:

                parts = line.strip().split()

                if len(parts) == 5:

                    class_id = int(parts[0])

                    if class_id > 5:
                        continue

                    new_lines.append(line)

            with open(file_path, "w") as f:

                f.writelines(new_lines)

print("All invalid labels removed successfully")