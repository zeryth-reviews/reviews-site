This guide provides a comprehensive walkthrough for installing and running a Minecraft Paper server on any non-rooted Android device. It covers installing the necessary Java environment, setting up the server, and making it accessible to others using `playit.gg`.

---

## Part 1: Installing Java 24 (JDK 24)

To run the latest versions of Minecraft servers, you need a recent Java Development Kit (JDK). Since Termux's default repositories offer older versions, we will install a proot-based Linux distribution to get JDK 24.

This method is ideal for devices with the following specifications:
- **Architecture**: ARM64 (aarch64)
- **Android Version**: Android 9 or newer
- **Root Access**: No
- **System**: 64-bit

### Step 1: Install Termux and Dependencies

1.  Download and install **Termux** from F-Droid for the latest, officially supported version.
2.  Open Termux and run the following commands to update packages and install required tools:

    ```bash
    pkg update && pkg upgrade
    pkg install proot-distro git wget curl
    ```

### Step 2: Install a Linux Distro (Ubuntu)

1.  Use `proot-distro` to install Ubuntu inside Termux:

    ```bash
    proot-distro install ubuntu
    ```

2.  Once installed, log into the Ubuntu environment:

    ```bash
    proot-distro login ubuntu
    ```

    Your command prompt should now look like `root@localhost:~#`, indicating you are inside the Ubuntu container.

### Step 3: Download and Install JDK 24

1.  Run the following commands **inside the Ubuntu environment** to download and extract OpenJDK 24.

    ```bash
    # Navigate to /opt, create it if it doesn't exist
    cd /opt || mkdir -p /opt && cd /opt

    # Download OpenJDK 24 for aarch64
    wget https://github.com/adoptium/temurin24-binaries/releases/download/jdk-24%2B36/OpenJDK24U-jdk_aarch64_linux_hotspot_24_36.tar.gz

    # Extract the archive
    tar -xvzf OpenJDK24U-jdk_aarch64_linux_hotspot_24_36.tar.gz

    # Rename the folder for simplicity
    mv jdk-24+36 jdk-24
    ```

### Step 4: Set Environment Variables

1.  Configure the system to recognize the new Java installation. Still inside Ubuntu, run:

    ```bash
    echo 'export JAVA_HOME=/opt/jdk-24' >> ~/.bashrc
    echo 'export PATH=$JAVA_HOME/bin:$PATH' >> ~/.bashrc
    source ~/.bashrc
    ```

### Step 5: Verify the Java Installation

1.  Check that Java 24 is correctly installed and configured:

    ```bash
    java -version
    ```

2.  The output should be similar to this:

    ```
    openjdk version "24" 2025-03-19
    OpenJDK Runtime Environment Temurin-24+36 (build 24+36)
    OpenJDK 64-Bit Server VM Temurin-24+36 (build 24+36, mixed mode)
    ```

---

## Part 2: Installing the Minecraft Paper Server

Now that Java is set up, you can install the PaperMC server, a high-performance fork of Minecraft.

### What You’ll Need

*   An Android phone with **3GB+ RAM** is recommended.
*   **Termux** from F-Droid.
*   A stable internet connection.

### Step 1: Login to Ubuntu
If you are not already, log into your Ubuntu environment:
```bash
proot-distro login ubuntu
```

### Step 2: Download the PaperMC Server

1.  Create a directory for your server and navigate into it.

    ```bash
    mkdir ~/mc-server
    cd ~/mc-server
    ```

2.  Go to the [PaperMC Downloads](https://papermc.io/downloads) page, select your desired Minecraft version, and copy the download link for the latest build.

3.  Use `curl` to download the server JAR file. Replace the URL with the one you copied.

    ```bash
    # Example for Paper 1.20.6 Build 354
    curl -o paper.jar "https://api.papermc.io/v2/projects/paper/versions/1.20.6/builds/354/downloads/paper-1.20.6-354.jar"
    ```

4.  Create a startup script to run the server.

    ```bash
    nano start.sh
    ```

5.  Paste the following content into the editor. You can adjust the RAM allocation (`-Xms` and `-Xmx`) based on your device's specifications (see the RAM guide below).

    ```bash
    #!/bin/bash
    /opt/jdk-24/bin/java -Xms512M -Xmx1500M -jar paper.jar nogui
    ```

    Press `Ctrl+O`, `Enter` to save, and `Ctrl+X` to exit.

6.  Make the script executable:

    ```bash
    chmod +x start.sh
    ```

### Step 3: Accept the EULA

1.  Run the server for the first time to generate configuration files.

    ```bash
    ./start.sh
    ```

2.  The server will start and then crash because you have not accepted the End User License Agreement (EULA). Edit the `eula.txt` file that was just created.

    ```bash
    nano eula.txt
    ```

3.  Change `eula=false` to `eula=true`, then save and exit.

4.  You can now start the server successfully:

    ```bash
    ./start.sh
    ```

### Step 4: Install Plugins (Geyser and Floodgate)

To allow both Java and Bedrock Edition players to join, you can install Geyser and Floodgate.

1.  Create a `plugins` directory inside your server folder:

    ```bash
    mkdir plugins
    ```

2.  Download the latest versions of Geyser and Floodgate into the `plugins` folder.

    ```bash
    cd ~/mc-server/plugins

    # Download Geyser
    curl -O https://download.geysermc.org/v2/projects/geyser/versions/latest/builds/latest/downloads/spigot
    mv spigot Geyser.jar

    # Download Floodgate
    curl -O https://download.geysermc.org/v2/projects/floodgate/versions/latest/builds/latest/downloads/spigot
    mv spigot Floodgate.jar
    ```

3.  Restart your server to generate the plugin configuration files. Edit them as needed, particularly `config.yml` in the Geyser folder.

---

## Part 3: Setting Up Public Access with playit.gg

This method compiles the `playit.gg` client from source directly in Termux, allowing others to connect to your server over the internet without port forwarding.

### Step 1: Update Termux and Install Rust

1.  Open a **new Termux session** (do not run this inside Ubuntu).
2.  Update your repositories and install `git` and `rust`.

    ```bash
    termux-change-repo
    pkg upgrade
    pkg install git rust
    ```
    *Note: You may be prompted to approve configuration file changes—press `y` when asked. Restart Termux after this step.*

### Step 2: Clone and Compile the Playit Agent

1.  Clone the `playit-agent` repository from GitHub.

    ```bash
    cd ~
    git clone -b master --single-branch --depth 1 https://github.com/playit-cloud/playit-agent
    cd playit-agent
    ```

2.  Compile and run the command-line client using Cargo, Rust's build tool.

    ```bash
    cargo run --release --bin playit-cli
    ```

### Step 3: Claim Your Tunnel

1.  After compiling, the client will run and display a claim link, which will look something like this:
    `https://playit.gg/claim/<some-code>`
2.  Copy this link and open it in a web browser on any device.
3.  Follow the instructions to create or log into a `playit.gg` account. This will link the tunnel to your account.
4.  On the `playit.gg` dashboard, create a **Minecraft Java** tunnel.

### Step 4: Save the Compiled Binary (Optional but Recommended)

To run `playit-cli` easily in the future without recompiling:

1.  Copy the compiled binary to your home directory.

    ```bash
    cp target/release/playit-cli ~/
    ```

2.  For even easier access, move it to a directory in your PATH.

    ```bash
    mkdir -p ~/.local/bin
    mv ~/playit-cli ~/.local/bin/
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
    source ~/.bashrc
    ```

3.  Now, you can start the tunnel anytime by simply typing:

    ```bash
    playit-cli
    ```

---

## Server Management and Tips

### RAM Allocation Guide

Adjust the `-Xms` (initial RAM) and `-Xmx` (maximum RAM) flags in your `start.sh` script according to your phone's available memory.

| Phone RAM | Safe Max | `-Xmx` Value  |
| :-------- | :------- | :------------ |
| 2 GB      | 1 GB     | `-Xmx1024M`   |
| 3 GB      | 1.5 GB   | `-Xmx1500M`   |
| 4 GB      | 2 GB     | `-Xmx2048M`   |
| 6+ GB     | 3 GB+    | `-Xmx3000M`   |

> **Note:** Termux is limited by Android's memory constraints. Setting the allocation too high may cause instability.

### Transferring Files (Plugins, Worlds)

1.  To access your phone's storage from Termux, run:

    ```bash
    termux-setup-storage
    ```

2.  Your phone's `Downloads` folder will be accessible at `~/storage/downloads` in Termux.
3.  Inside the Ubuntu environment, this path corresponds to `/data/data/com.termux/files/home/storage/downloads`.
4.  To copy a plugin from your phone's downloads to the server, use a command like this from within Ubuntu:

    ```bash
    cp /data/data/com.termux/files/home/storage/downloads/MyPlugin.jar ~/mc-server/plugins/
    ```

### Stopping the Server Safely

To shut down your Minecraft server without losing data, type `stop` in the server console and press `Enter`. Wait for it to finish saving before closing Termux.