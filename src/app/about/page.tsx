export default function About() {
  return (
    <div>
      <h2>About</h2>
      <p>Name: WINATA ADITYA RAYSEN SUSANTO</p>
      <p>Student number (La Trobe Student ID): 22586621</p>

      {/* Demo Video */}
      <h3>Demo Video</h3>
      <iframe
        src="https://drive.google.com/file/d/1EuqfUJL_F5iuJfwSMcce0Sd9MNSF3jYE/preview"
        width="640"
        height="360"
        allow="autoplay"
        allowFullScreen
        title="Demo Video"
        style={{ border: "none" }}
      ></iframe>
      <p>
        If the video looks blurry or doesn’t load,{" "}
        <a
          href="https://drive.google.com/file/d/1EuqfUJL_F5iuJfwSMcce0Sd9MNSF3jYE/view?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
        >
          click here to open directly in Google Drive
        </a>.
      </p>
      <p>Enable CC subtitles in Google Drive for captions and transcript.</p>

      {/* Assignment Video */}
      <h3>Assignment Video (Demo, Code & Grading Criteria Explanation)</h3>
      <iframe
        src="https://drive.google.com/file/d/1rNjB05-kBg1C83PJZkUWQp9Af_Wq-sRr/preview"
        width="640"
        height="360"
        allow="autoplay"
        allowFullScreen
        title="Assignment Video"
        style={{ border: "none" }}
      ></iframe>
      <p>
        Looks blurry?{" "}
        <a
          href="https://drive.google.com/file/d/1rNjB05-kBg1C83PJZkUWQp9Af_Wq-sRr/view?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
        >
          Watch directly on Google Drive
        </a>.
      </p>
    </div>
  );
}
