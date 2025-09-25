export default function About() {
  return (
    <div>
      <h2>About</h2>
      <p>Name: WINATA ADITYA RAYSEN SUSANTO</p>
      <p>Student number (La Trobe Student ID): 22586621</p>

      <h3>Demo Video (put your recorded video file in /public/demo.mp4)</h3>
      <video controls width={640} aria-label="Usage demo">
        <source src="/demo.mp4" type="video/mp4" />
        Your browser does not support the video element.
      </video>
      <p>Provide captions and a short transcript under the video (accessibility).</p>
    </div>
  );
}
