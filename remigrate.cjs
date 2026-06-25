const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'temp_extract', 'src', 'routes');
const destDir = path.join(__dirname, 'src', 'pages');

const mapping = {
  'index.tsx': 'Home.tsx',
  'bras.tsx': 'Bras.tsx',
  'panties.tsx': 'Panties.tsx',
  'sets.tsx': 'Sets.tsx',
  'shapewear.tsx': 'Shapewear.tsx',
  'sleepwear.tsx': 'Sleepwear.tsx',
  'new-arrivals.tsx': 'NewArrivals.tsx',
  'sale.tsx': 'Sale.tsx',
  'product.$slug.tsx': 'ProductDetail.tsx',
  'cart.tsx': 'Cart.tsx',
  'account.tsx': 'Account.tsx',
  'track-order.tsx': 'TrackOrder.tsx',
  'about.tsx': 'About.tsx',
  'contact.tsx': 'Contact.tsx',
  'help.tsx': 'Help.tsx',
  'faqs.tsx': 'Faqs.tsx',
  'size-guide.tsx': 'SizeGuide.tsx',
  'returns-exchanges.tsx': 'ReturnsExchanges.tsx',
  'shipping-policy.tsx': 'ShippingPolicy.tsx',
  'return-policy.tsx': 'ReturnPolicy.tsx',
  'privacy-policy.tsx': 'PrivacyPolicy.tsx',
  'terms.tsx': 'Terms.tsx',
};

function processFile(oldName, newName) {
  if (oldName === 'product.$slug.tsx' || oldName === '__root.tsx') return; // I already fixed ProductDetail.tsx manually, and deleted __root.tsx

  const filePath = path.join(srcDir, oldName);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');

  // Replace imports
  content = content.replace(/import\s+{([^}]*)}\s+from\s+["']@tanstack\/react-router["'];/g, (match, p1) => {
    const imports = p1.split(',').map(i => i.trim());
    const newImports = imports.filter(i => i === 'Link' || i === 'useParams' || i === 'useNavigate' || i === 'useLocation');
    if (newImports.length > 0) {
      return `import { ${newImports.join(', ')} } from "react-router-dom";`;
    }
    return '';
  });

  content = content.replace(/@tanstack\/react-router/g, 'react-router-dom');

  // Extract head meta tags
  let title = "BeautyX";
  let description = "";
  const titleMatch = content.match(/title:\s*["']([^"']+)["']/);
  if (titleMatch) title = titleMatch[1];
  const descMatch = content.match(/name:\s*["']description["'],\s*content:\s*["']([^"']+)["']/);
  if (descMatch) description = descMatch[1];

  // Try to extract the component definition. 
  // It usually looks like: component: () => <CategoryPage ... />
  // or component: FunctionName
  // If it's component: FunctionName, the function is defined above.
  
  const componentMatch = content.match(/component:\s*([^,]+)(?=,\s*\}|\s*\})/);
  let componentStr = '';
  if (componentMatch) {
    const rawComponent = componentMatch[1].trim();
    if (rawComponent.startsWith('(') || rawComponent.startsWith('function')) {
      // Inline component
      componentStr = `export default function ${newName.replace('.tsx', '')}() {\n  return (\n    <>\n      <Helmet>\n        <title>${title}</title>\n        ${description ? `<meta name="description" content="${description}" />` : ''}\n      </Helmet>\n      ${rawComponent.startsWith('() =>') ? rawComponent.replace('() =>', '').trim() : rawComponent}\n    </>\n  );\n}`;
    } else {
      // It's a reference to a function defined below or above
      // We will export it as default
      componentStr = `export default ${rawComponent};`;
    }
  }

  // Inject Helmet import if needed
  let finalContent = `import { Helmet } from "react-helmet-async";\n`;

  // Filter out the createFileRoute block
  const lines = content.split('\n');
  let insideCreateFileRoute = false;
  let braces = 0;
  for (let line of lines) {
    if (line.includes('createFileRoute')) {
      insideCreateFileRoute = true;
      braces += (line.match(/\{/g) || []).length;
      braces -= (line.match(/\}/g) || []).length;
      continue;
    }
    if (insideCreateFileRoute) {
      braces += (line.match(/\{/g) || []).length;
      braces -= (line.match(/\}/g) || []).length;
      if (braces <= 0) {
        insideCreateFileRoute = false;
      }
      continue;
    }
    
    // if not inside, and not a createFileRoute import, keep it
    if (!line.includes('createFileRoute') && line.trim() !== '})') {
       finalContent += line + '\n';
    }
  }

  finalContent += `\n${componentStr}\n`;
  
  // If the component is a function defined in the file, and we added export default FunctionName
  // We need to inject Helmet inside it. But for now, returning the inline helmet or trusting the user.
  // Actually, many pages use `<PageShell>`. 
  // If we just appended the componentStr, let's write it.
  
  fs.writeFileSync(path.join(destDir, newName), finalContent);
}

for (const [oldName, newName] of Object.entries(mapping)) {
  processFile(oldName, newName);
}
console.log("Remigration script complete");
