export function renderErrorPage(stylesheetUrl: string): string {
  return `<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script>try{if(localStorage.getItem("theme")==="light")document.documentElement.classList.remove("dark")}catch(e){}</script>
    <link rel="stylesheet" href="${stylesheetUrl}" />
  </head>
  <body class="bg-background text-foreground">
    <main class="page-background flex min-h-screen items-center justify-center px-4">
      <div class="glass-card max-w-md p-10 text-center">
        <h1 class="text-xl font-semibold tracking-tight">This page didn't load</h1>
        <p class="mt-2 text-sm text-muted-foreground">Something went wrong on our end. You can try refreshing or head back home.</p>
        <div class="mt-6 flex flex-wrap justify-center gap-2">
          <button class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90" onclick="location.reload()">Try again</button>
          <a class="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent" href="/en">Go home</a>
        </div>
      </div>
    </main>
  </body>
</html>`;
}
