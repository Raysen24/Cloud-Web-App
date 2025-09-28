export default function About() {
  return (
    <div>
      <h2>About</h2>
      <p>Name: WINATA ADITYA RAYSEN SUSANTO</p>
      <p>Student number (La Trobe Student ID): 22586621</p>

      {/* Demo Video */}
      <h3>Demo Video</h3>
      <iframe
        src="https://drive.google.com/file/d/1DayKbGdx8NR8vZ1drMBPTT9YuAz07lmM/preview"
        width="640"
        height="360"
        allow="autoplay"
        title="Demo Video"
        style={{ border: "none" }}
      ></iframe>
      <p>
        If the video looks blurry or doesn’t load,{" "}
        <a
          href="https://drive.google.com/file/d/1DayKbGdx8NR8vZ1drMBPTT9YuAz07lmM/view?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
        >
          click here to open directly in Google Drive
        </a>.
      </p>
      <p>Enable CC subtitles in Google Drive for captions and transcript.</p>

      {/* Assignment Video */}
      <h3>Assignment Video (Code & Grading Criteria Explanation)</h3>
      <iframe
        src="https://drive.google.com/file/d/1DayKbGdx8NR8vZ1drMBPTT9YuAz07lmM/preview"
        width="640"
        height="360"
        allow="autoplay"
        title="Assignment Video"
        style={{ border: "none" }}
      ></iframe>
      <p>
        Looks blurry?{" "}
        <a
          href="https://drive.google.com/file/d/1DayKbGdx8NR8vZ1drMBPTT9YuAz07lmM/view?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
        >
          Watch directly on Google Drive
        </a>.
      </p>
    </div>
  );
}
