function clearResult(id) {
  document.getElementById(id).innerHTML = "";
}

document.addEventListener("DOMContentLoaded", function () {

  // HEADER
  document.getElementById("header").innerHTML = `
    <header class="site-header">
      <div class="header-container">
        <div class="logo">
          <a href="/index.html">
            <img src="/images/logo.png" alt="Your Simple Calculator">
          </a>
        </div>

        <nav class="main-nav">
          <a href="/calculators/Financial/">Financial</a>
          <a href="/calculators/Health/">Fitness & Health</a>
          <a href="/calculators/Math/">Math</a>
          <a href="/calculators/Other/">Other</a>
        </nav>
      </div>
    </header>
  `;

  // FOOTER
  document.getElementById("footer").innerHTML = `
    <footer class="site-footer">
      <p>© ${new Date().getFullYear()} Your Simple Calculator. All rights reserved.</p>
    </footer>
  `;
});

