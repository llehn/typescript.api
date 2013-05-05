// Acid Frameworks.  All rights reserved.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/// <reference path="decl/typescript.d.ts" />
/// <reference path="astwalker.ts" />
/// <reference path="compiler.ts" />

module TypeScript.Api {	
	
	//////////////////////////////////////////////////////////////////
	// ASTUtil: helpful methods for working with TS AST.
	//////////////////////////////////////////////////////////////////	
	class ASTUtil {
		
		public static ResolveQualifiedTypeName (ast:TypeScript.AST) : string { // NodeType = 32
			var result = [];
			var walk = (ast:TypeScript.AST) => {
				if(ast.nodeType == TypeScript.NodeType.MemberAccessExpression) { // 32
					var expression = <TypeScript.BinaryExpression>ast;
					walk(expression.operand1);
					walk(expression.operand2);
				}
				if(ast.nodeType == TypeScript.NodeType.GenericType) { // 10
					var generic_type = <TypeScript.GenericType>ast;
					var expression = <TypeScript.BinaryExpression>generic_type.name;
					if(expression.nodeType == TypeScript.NodeType.Name) {
						walk(expression);
					}
					if(expression.nodeType == TypeScript.NodeType.MemberAccessExpression) {
						walk(expression.operand1);
						walk(expression.operand2);				
					}
				}				
				if(ast.nodeType == TypeScript.NodeType.Name) { // 20
					var name = <TypeScript.Identifier>ast;
					result.push(name.text);
				}
			};
			walk(ast);
			return result.join('.');
		}
	}
	
	//////////////////////////////////////////////////////////////////
	// Type:
	////////////////////////////////////////////////////////////////// 
	export class Type  {
		public name 	 : string;
		public arguments : Type[];
		
		constructor() {
			this.arguments = [];
		}	
		public static create(ast:TypeScript.TypeReference) : Type {
			//console.log("Type");
			var create_type = (ast:TypeScript.TypeReference) : Type => {
				var type  = new Type();
				type.name = ASTUtil.ResolveQualifiedTypeName (ast.term);
				switch(ast.term.nodeType){ 
					case TypeScript.NodeType.GenericType:
						var generic_type = <TypeScript.GenericType>ast.term;
						for(var n in generic_type.typeArguments.members) {
							var argument = create_type(generic_type.typeArguments.members[n]);
							type.arguments.push(argument);
						}
						break;
				}
				return type;
			};
			
			return create_type(ast);
		}
	}
	
	
	
	//////////////////////////////////////////////////////////////////
	// Variable:
	//////////////////////////////////////////////////////////////////	
	export class Variable {
		public name       : string;
		public type       : Type;
		constructor() {
			
		}
		
		public static create(ast:TypeScript.VariableDeclarator): Variable {
			//console.log('Variable');
			var result   = new Variable();
			result.name  = ast.id.text;
			
			if(!ast.typeExpr) { // expressions picked up in typeref.
				result.type  = new Type();
				result.type.name = "any";
			}  
			
			return result;
		}  
	}
	
	//////////////////////////////////////////////////////////////////
	// Parameter:
	//////////////////////////////////////////////////////////////////
	
	export class Parameter {
		public id 		  : string;
		public name		  : string;
		public type		  : string;
		constructor(){ }

		public static create(ast:TypeScript.Parameter): Parameter {
			var result  = new Parameter();
			result.name  = ast.id.text;
			var typeExpr = <TypeScript.TypeReference>ast.typeExpr;
			
			if(typeExpr){
				result.type = ASTUtil.ResolveQualifiedTypeName(typeExpr.term); 
			}
			return result;
		}   
	}
	
	//////////////////////////////////////////////////////////////////
	// Method:
	//////////////////////////////////////////////////////////////////	
	export class Method {
		public id 		  : string;
		public parameters : Parameter[];
		public name       : string;
		public returns    : string;

		constructor () {
			this.parameters = [];
		}

		public static create(ast:TypeScript.FunctionDeclaration): Method  {
			//console.log('Method');
			var result   = new Method();
			result.name  = ast.getNameText();
			var returnTypeAnnotation = <TypeScript.TypeReference>ast.returnTypeAnnotation;
			if(returnTypeAnnotation){
				result.returns = ASTUtil.ResolveQualifiedTypeName(returnTypeAnnotation.term); 
			}
			return result;
		}
	}
	//////////////////////////////////////////////////////////////////
	// Class:
	//////////////////////////////////////////////////////////////////	 
	export class Class {
		public methods    : Method     [];
		public variables  : Variable   [];
		public parameters : string     [];
		public extends    : string     [];
		public implements : string     [];
		public name       : string;
		constructor() {
			this.methods    = [];
			this.variables  = [];
			this.extends    = [];
			this.implements = [];
			this.parameters = [];
		}
		public static create(ast:TypeScript.ClassDeclaration): Class { 
			
			//console.log('Class');
			var result = new Class();
			result.name = ast.name.text;
			
			if(ast.typeParameters){
				if (ast.typeParameters.members) {
					for(var n in ast.typeParameters.members) { 
						result.parameters.push(ast.typeParameters.members[n].name.text);
					}
				}
			}
			
			if (ast.implementsList) {
				if (ast.implementsList.members) {
					for(var n in ast.implementsList.members) { 
						var named_decl = <TypeScript.NamedDeclaration>ast.implementsList.members[n];
						result.implements.push( named_decl.text );
					}
				}
			}
			
			if (ast.extendsList) {
				if (ast.extendsList.members) {
					for(var n in ast.extendsList.members) { 
						var named_decl = <TypeScript.NamedDeclaration>ast.extendsList.members[n];
						result.extends.push( named_decl.text );
					}
				}
			}
			
			return result;
		}
	}
	//////////////////////////////////////////////////////////////////
	// Interface:
	//////////////////////////////////////////////////////////////////
	export class Interface {
		public methods    : Method    [];
		public variables  : Variable  [];
		public parameters : string    [];
		public extends    : string    [];
		public name       : string;
		
		constructor () {
			this.methods    = [];
			this.variables  = [];
			this.extends    = [];
			this.parameters = [];
		}
		
		public static create(ast:TypeScript.InterfaceDeclaration): Interface {
			//console.log('Interface');
			var result  = new Interface();
			result.name = ast.name.text;
			if(ast.typeParameters){
				if (ast.typeParameters.members) {
					for(var n in ast.typeParameters.members) { 
						result.parameters.push(ast.typeParameters.members[n].name.text);
					}
				}
			}
			
			if (ast.extendsList) {
				if (ast.extendsList.members) {
					for(var n in ast.extendsList.members) { 
						var named_decl = <TypeScript.NamedDeclaration>ast.extendsList.members[n];
						result.extends.push( named_decl.text );
					}
				}
			}
			return result;
		}
	}
	//////////////////////////////////////////////////////////////////
	// Import:
	//////////////////////////////////////////////////////////////////
	export class Import {
		public name       : string;
		public alias      : string;

		constructor() {
		
		}

		public static create(ast:TypeScript.ImportDeclaration): Import {
			//console.log('Import');
			var result   = new Import();
			result.name  = ast.id.text;
			result.alias = ast.getAliasName(ast);
			return result;
		}

	}
	//////////////////////////////////////////////////////////////////
	// Module:
	//////////////////////////////////////////////////////////////////
	export class Module {
		public imports    : Import    [];
		public modules    : Module    [];
		public interfaces : Interface [];
		public classes    : Class     [];
		public methods    : Method    [];
		public variables  : Variable  [];
		public name       : string;

		constructor () {
			this.imports    = [];
			this.modules    = [];
			this.interfaces = [];
			this.classes    = [];
			this.methods    = [];
			this.variables  = [];
		}

		public static create (ast:TypeScript.ModuleDeclaration) : Module {
			//console.log('Module');
			var result   = new Module();
			result.name  = ast.prettyName;			
			return result;
		}
	}
	//////////////////////////////////////////////////////////////////
	// Script:
	//////////////////////////////////////////////////////////////////
	export class Script {
		public modules    : Module    [];
		public interfaces : Interface [];
		public classes    : Class     [];
		public methods    : Method    [];
		public variables  : Variable  [];
		public filename   : string;
		
		constructor () {
			this.modules    = [];
			this.interfaces = [];
			this.classes    = [];
			this.methods    = [];
			this.variables  = [];
		}

		public static create(ast:TypeScript.Script): Script {
			//console.log('Script');
			var result = new Script();
			// nothing to do here...
			return result;
		}
	}
	
	//////////////////////////////////////////////////////////////////
	// Reflection:
	//////////////////////////////////////////////////////////////////
	export class Reflection {
		
		public scripts : Script[];
		
		constructor() {
			this.scripts = [];
		}
		
		public static create(compilation:TypeScript.Api.Compilation) : Reflection {
			var reflection     = new Reflection();
			var walker         = new ASTWalker();
			walker.userdata    = [];
			walker.userdata.push(reflection);
		
			// foreach compilation unit..
			for(var n in compilation.units) {
				
				// walk the units ast..
				walker.walk(compilation.units[n].ast, (walker, ast) => {
					
					// catch here....
					if(walker.stack.length < walker.userdata.length - 1) {
						do    { walker.userdata.pop(); } 
						while (walker.stack.length < walker.userdata.length - 1);
					}
					
					// set the parent node...
					var parent = walker.userdata[walker.userdata.length - 1];
					
					// what node did we get?
					switch (ast.nodeType) {
						
						case TypeScript.NodeType.VariableDeclarator:
							var variable = Variable.create(<TypeScript.VariableDeclarator>ast);
							parent.variables.push(variable);
							walker.userdata.push(variable);
							break;
						
						case TypeScript.NodeType.TypeRef: 
							var type = Type.create(<TypeScript.TypeReference>ast);
							parent.type = type;
							walker.userdata.push(type);							
							break;
							
						case TypeScript.NodeType.Parameter:
							var parameter = Parameter.create(<TypeScript.Parameter>ast);
							parent.parameters.push(parameter);
							walker.userdata.push(parameter);
							break;
							
						case TypeScript.NodeType.FunctionDeclaration:
							var method = Method.create(<TypeScript.FunctionDeclaration>ast);
							parent.methods.push(method);
							walker.userdata.push(method);
							break;
							
						case TypeScript.NodeType.ClassDeclaration:
							var _class = Class.create(<TypeScript.ClassDeclaration>ast);
							parent.classes.push(_class);
							walker.userdata.push(_class);
							break;

						case TypeScript.NodeType.InterfaceDeclaration:
							var _interface = Interface.create(<TypeScript.InterfaceDeclaration>ast);
							parent.interfaces.push(_interface);
							walker.userdata.push(_interface);
							break;

						case TypeScript.NodeType.ImportDeclaration:
							var _import = Import.create(<TypeScript.ImportDeclaration>ast);
							parent.imports.push(_import);
							walker.userdata.push(_import);
							break;
							
						case TypeScript.NodeType.ModuleDeclaration:
							var _module = Module.create(<TypeScript.ModuleDeclaration>ast);
							parent.modules.push(_module);
							walker.userdata.push(_module);
							break;	
							
						case TypeScript.NodeType.Script:
							var _script = Script.create(<TypeScript.Script>ast);
							_script.filename = compilation.units[n].filename; // snap on the filename...
							parent.scripts.push(_script);
							walker.userdata.push(_script);
							break;						
					}
				});
			}
			
			return reflection;
		
		}
	}
	//////////////////////////////////////////////////////////////////
	// Reflector:
	//////////////////////////////////////////////////////////////////	
	export class Reflector {
		
		constructor() {
			
		}
		
		public reflect(compilation:TypeScript.Api.Compilation) : Reflection {
			
			return TypeScript.Api.Reflection.create(compilation);
		}
		
	}

}