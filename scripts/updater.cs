using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Net;
using System.Text.RegularExpressions;
using System.Threading;
using System.Windows.Forms;

namespace PullTubeUpdater
{
    static class Program
    {
        [STAThread]
        static void Main(string[] args)
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new UpdaterForm(args));
        }
    }

    public class UpdaterForm : Form
    {
        private Label lblTitle;
        private Label lblStatus;
        private ProgressBar progressBar;
        private Button btnAction;
        private string[] cliArgs;
        private string downloadUrl = "";
        private string latestTag = "";
        private string tempInstallerPath = "";

        public UpdaterForm(string[] args)
        {
            this.cliArgs = args;
            InitializeComponent();
            this.Load += UpdaterForm_Load;
        }

        private void InitializeComponent()
        {
            this.Text = "PullTube Updater";
            this.Size = new Size(460, 225);
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.StartPosition = FormStartPosition.CenterScreen;
            this.BackColor = Color.FromArgb(15, 15, 22); // Deep PullTube dark
            this.ForeColor = Color.White;

            lblTitle = new Label();
            lblTitle.Text = "PullTube Update Manager";
            lblTitle.Font = new Font("Segoe UI", 12F, FontStyle.Bold);
            lblTitle.ForeColor = Color.FromArgb(192, 132, 252); // Violet-400
            lblTitle.Location = new Point(24, 20);
            lblTitle.AutoSize = true;

            lblStatus = new Label();
            lblStatus.Text = "Checking for available updates...";
            lblStatus.Font = new Font("Segoe UI", 9.5F);
            lblStatus.ForeColor = Color.FromArgb(226, 232, 240); // Slate-200
            lblStatus.Location = new Point(24, 55);
            lblStatus.Size = new Size(400, 38);

            progressBar = new ProgressBar();
            progressBar.Location = new Point(24, 105);
            progressBar.Size = new Size(396, 14);
            progressBar.Style = ProgressBarStyle.Marquee;

            btnAction = new Button();
            btnAction.Text = "Cancel";
            btnAction.Font = new Font("Segoe UI", 9F, FontStyle.Bold);
            btnAction.BackColor = Color.FromArgb(30, 30, 46);
            btnAction.ForeColor = Color.FromArgb(226, 232, 240);
            btnAction.FlatStyle = FlatStyle.Flat;
            btnAction.FlatAppearance.BorderColor = Color.FromArgb(75, 85, 99);
            btnAction.Location = new Point(320, 135);
            btnAction.Size = new Size(100, 32);
            btnAction.Cursor = Cursors.Hand;
            btnAction.Click += (s, e) => this.Close();

            this.Controls.Add(lblTitle);
            this.Controls.Add(lblStatus);
            this.Controls.Add(progressBar);
            this.Controls.Add(btnAction);
        }

        private void UpdaterForm_Load(object sender, EventArgs e)
        {
            Thread thread = new Thread(CheckAndDownloadUpdate);
            thread.IsBackground = true;
            thread.Start();
        }

        private void CheckAndDownloadUpdate()
        {
            try
            {
                ServicePointManager.SecurityProtocol = (SecurityProtocolType)3072; // TLS 1.2
                UpdateStatus("Connecting to GitHub Releases...");

                string currentVersion = GetCurrentVersion();
                string apiUrl = "https://api.github.com/repos/jigneshls/Pulltube/releases/latest";

                HttpWebRequest request = (HttpWebRequest)WebRequest.Create(apiUrl);
                request.UserAgent = "PullTube-Updater";
                request.Accept = "application/vnd.github.v3+json";

                string jsonResponse = "";
                using (HttpWebResponse response = (HttpWebResponse)request.GetResponse())
                using (StreamReader reader = new StreamReader(response.GetResponseStream()))
                {
                    jsonResponse = reader.ReadToEnd();
                }

                // Extract tag_name
                Match tagMatch = Regex.Match(jsonResponse, "\"tag_name\"\\s*:\\s*\"([^\"]+)\"");
                if (!tagMatch.Success)
                {
                    ShowError("Failed to parse latest release tag from GitHub.");
                    return;
                }
                latestTag = tagMatch.Groups[1].Value.TrimStart('v', 'V');

                // Extract browser_download_url for .exe
                Match urlMatch = Regex.Match(jsonResponse, "\"browser_download_url\"\\s*:\\s*\"([^\"]+\\.exe)\"");
                if (!urlMatch.Success)
                {
                    ShowError("No Windows installer (.exe) found in the latest release.");
                    return;
                }
                downloadUrl = urlMatch.Groups[1].Value;

                // Compare versions
                if (!IsNewerVersion(latestTag, currentVersion))
                {
                    UpdateStatus("You are already on the latest version (v" + currentVersion + ").");
                    this.Invoke((MethodInvoker)delegate {
                        progressBar.Style = ProgressBarStyle.Blocks;
                        progressBar.Value = 100;
                        btnAction.Text = "Close";
                    });
                    return;
                }

                UpdateStatus("New version available: v" + latestTag + " (Current: v" + currentVersion + ")\nDownloading update...");
                this.Invoke((MethodInvoker)delegate {
                    progressBar.Style = ProgressBarStyle.Blocks;
                    progressBar.Value = 0;
                });

                string tempDir = Path.GetTempPath();
                tempInstallerPath = Path.Combine(tempDir, "PullTube-Setup-" + latestTag + ".exe");

                using (WebClient client = new WebClient())
                {
                    client.Headers.Add("User-Agent", "PullTube-Updater");
                    client.DownloadProgressChanged += (s, ev) =>
                    {
                        this.Invoke((MethodInvoker)delegate {
                            progressBar.Value = ev.ProgressPercentage;
                            double mbReceived = ev.BytesReceived / (1024.0 * 1024.0);
                            double mbTotal = ev.TotalBytesToReceive / (1024.0 * 1024.0);
                            lblStatus.Text = string.Format("Downloading: {0:F1} MB / {1:F1} MB ({2}%)", mbReceived, mbTotal, ev.ProgressPercentage);
                        });
                    };

                    client.DownloadFileCompleted += (s, ev) =>
                    {
                        if (ev.Error != null)
                        {
                            ShowError("Download failed: " + ev.Error.Message);
                            return;
                        }

                        InstallAndRestart();
                    };

                    client.DownloadFileAsync(new Uri(downloadUrl), tempInstallerPath);
                }
            }
            catch (Exception ex)
            {
                ShowError("Update error: " + ex.Message);
            }
        }

        private void InstallAndRestart()
        {
            UpdateStatus("Installing update... Closing running app instances.");
            this.Invoke((MethodInvoker)delegate {
                progressBar.Style = ProgressBarStyle.Marquee;
            });

            try
            {
                // Kill running PullTube processes cleanly
                Process[] processes = Process.GetProcessesByName("PullTube");
                foreach (Process p in processes)
                {
                    try
                    {
                        p.CloseMainWindow();
                        if (!p.WaitForExit(3000))
                        {
                            p.Kill();
                        }
                    }
                    catch { }
                }

                Thread.Sleep(1000);

                // Launch installer
                ProcessStartInfo startInfo = new ProcessStartInfo();
                startInfo.FileName = tempInstallerPath;
                startInfo.UseShellExecute = true;

                // If silent flag was passed in args
                bool silent = false;
                foreach (string arg in cliArgs)
                {
                    if (arg.Equals("/S", StringComparison.OrdinalIgnoreCase) || arg.Equals("--silent", StringComparison.OrdinalIgnoreCase))
                    {
                        silent = true;
                        break;
                    }
                }

                if (silent)
                {
                    startInfo.Arguments = "/S";
                }

                Process.Start(startInfo);

                this.Invoke((MethodInvoker)delegate {
                    this.Close();
                });
            }
            catch (Exception ex)
            {
                ShowError("Failed to launch installer: " + ex.Message);
            }
        }

        private string GetCurrentVersion()
        {
            // If passed via command line argument
            if (cliArgs.Length > 0 && !cliArgs[0].StartsWith("-") && !cliArgs[0].StartsWith("/"))
            {
                return cliArgs[0].TrimStart('v', 'V');
            }

            // Check if PullTube.exe exists in directory
            string appDir = AppDomain.CurrentDomain.BaseDirectory;
            string exePath = Path.Combine(appDir, "PullTube.exe");
            if (!File.Exists(exePath))
            {
                exePath = Path.Combine(Directory.GetParent(appDir).FullName, "PullTube.exe");
            }
            if (File.Exists(exePath))
            {
                FileVersionInfo fvi = FileVersionInfo.GetVersionInfo(exePath);
                if (!string.IsNullOrEmpty(fvi.FileVersion))
                {
                    return fvi.FileVersion.TrimStart('v', 'V');
                }
            }

            return "1.0.1";
        }

        private bool IsNewerVersion(string latest, string current)
        {
            try
            {
                Version vLatest = new Version(NormalizeVersion(latest));
                Version vCurrent = new Version(NormalizeVersion(current));
                return vLatest > vCurrent;
            }
            catch
            {
                return !string.Equals(latest, current, StringComparison.OrdinalIgnoreCase);
            }
        }

        private string NormalizeVersion(string v)
        {
            string clean = v.TrimStart('v', 'V');
            string[] parts = clean.Split('.');
            if (parts.Length == 1) return clean + ".0.0.0";
            if (parts.Length == 2) return clean + ".0.0";
            if (parts.Length == 3) return clean + ".0";
            return clean;
        }

        private void UpdateStatus(string status)
        {
            if (this.IsDisposed) return;
            this.Invoke((MethodInvoker)delegate {
                lblStatus.Text = status;
            });
        }

        private void ShowError(string msg)
        {
            if (this.IsDisposed) return;
            this.Invoke((MethodInvoker)delegate {
                lblStatus.Text = msg;
                progressBar.Style = ProgressBarStyle.Blocks;
                progressBar.Value = 0;
                btnAction.Text = "Close";
            });
        }
    }
}
