import { parse } from 'acorn';

const apiNames = new Set(['readLaser', 'readOdometry', 'readBumper', 'setSpeed', 'random', 'memory', 'remember']);
const types = new Set(['Program', 'VariableDeclaration', 'VariableDeclarator', 'Identifier', 'Literal', 'ExpressionStatement', 'CallExpression', 'MemberExpression', 'BinaryExpression', 'LogicalExpression', 'UnaryExpression', 'IfStatement', 'BlockStatement', 'ConditionalExpression', 'EmptyStatement']);
const binaries = { '+': (a,b) => a+b, '-': (a,b) => a-b, '*': (a,b) => a*b, '/': (a,b) => a/b, '%': (a,b) => a%b,
  '<': (a,b) => a<b, '>': (a,b) => a>b, '<=': (a,b) => a<=b, '>=': (a,b) => a>=b, '===': (a,b) => a===b, '!==': (a,b) => a!==b };

export const DEFAULT_CONTROLLER = `const scan = readLaser();
const front = scan.length === 9 ? scan[4] : scan[0];
if (readBumper() || front < 0.9) {
  setSpeed(0, 1.6);
} else {
  setSpeed(0.65, 0);
}`;

export function compileController(source) {
  if (typeof source !== 'string' || source.length > 8000) throw new Error('Controlador: limite de 8.000 caracteres');
  let ast;
  try { ast = parse(source, { ecmaVersion: 2022 }); } catch (error) { throw new Error(`Controlador: sintaxe inválida: ${error.message}`); }
  let count = 0;
  function validate(node, depth = 0) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach(n => validate(n, depth)); return; }
    if (++count > 1000 || depth > 40) throw new Error('Controlador: programa excede orçamento de complexidade');
    if (!types.has(node.type)) throw new Error(`Controlador: sintaxe não permitida (${node.type})`);
    if (node.type === 'CallExpression' && (node.callee.type !== 'Identifier' || !apiNames.has(node.callee.name))) throw new Error('Controlador: chamada fora da API permitida');
    if (node.type === 'MemberExpression' && !node.computed && !['x', 'y', 'theta', 'distance', 'length'].includes(node.property.name)) throw new Error('Controlador: propriedade não permitida');
    if (node.type === 'BinaryExpression' && !Object.hasOwn(binaries, node.operator)) throw new Error('Controlador: operador não permitido');
    if (node.type === 'LogicalExpression' && !['&&','||'].includes(node.operator)) throw new Error('Controlador: operador lógico não permitido');
    if (node.type === 'UnaryExpression' && !['!', '-', '+'].includes(node.operator)) throw new Error('Controlador: operador unário não permitido');
    if (node.type === 'Literal' && !['number','boolean'].includes(typeof node.value)) throw new Error('Controlador: apenas literais numéricos e booleanos');
    if (node.type === 'VariableDeclarator' && apiNames.has(node.id.name)) throw new Error('Controlador: nome reservado da API');
    for (const [key, child] of Object.entries(node)) if (!['start','end','type'].includes(key) && child && typeof child === 'object') validate(child, depth + 1);
  }
  validate(ast);
  return api => {
    const vars = Object.create(null); let budget = 1000;
    function evaluate(n) {
      if (--budget < 0) throw new Error('Controlador: orçamento de execução excedido');
      switch (n.type) {
        case 'Program': case 'BlockStatement': n.body.forEach(evaluate); break;
        case 'EmptyStatement': break;
        case 'VariableDeclaration': n.declarations.forEach(evaluate); break;
        case 'VariableDeclarator': vars[n.id.name] = n.init ? evaluate(n.init) : undefined; break;
        case 'Literal': return n.value;
        case 'Identifier':
          if (!Object.hasOwn(vars, n.name)) throw new Error(`Controlador: variável desconhecida ${n.name}`);
          return vars[n.name];
        case 'ExpressionStatement': return evaluate(n.expression);
        case 'CallExpression': return api[n.callee.name](...n.arguments.map(evaluate));
        case 'MemberExpression': {
          const obj = evaluate(n.object), key = n.computed ? evaluate(n.property) : n.property.name;
          const allowed = Array.isArray(obj) ? key === 'length' || Number.isInteger(key) && key >= 0 && key < obj.length : obj && ['x','y','theta','distance'].includes(key);
          if (!allowed) throw new Error('Controlador: leitura de propriedade inválida');
          return obj[key];
        }
        case 'BinaryExpression': return binaries[n.operator](evaluate(n.left), evaluate(n.right));
        case 'LogicalExpression': return n.operator === '&&' ? evaluate(n.left) && evaluate(n.right) : evaluate(n.left) || evaluate(n.right);
        case 'UnaryExpression': { const v = evaluate(n.argument); return n.operator === '!' ? !v : n.operator === '-' ? -v : +v; }
        case 'ConditionalExpression': return evaluate(n.test) ? evaluate(n.consequent) : evaluate(n.alternate);
        case 'IfStatement': if (evaluate(n.test)) evaluate(n.consequent); else if (n.alternate) evaluate(n.alternate); break;
      }
    }
    evaluate(ast);
  };
}
