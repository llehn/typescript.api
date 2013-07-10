// Copyright (c) 2013 haydn paterson (sinclair).  All rights reserved.
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

/// <reference path="../decl/typescript.d.ts" />
/// <reference path="ReflectedType.ts" />

module TypeScript.Api.Reflect 
{
	export class Import extends ReflectedType
	{
		public alias      : string;

        constructor() {
        
            super('import');
        }

		public static create(ast:TypeScript.ImportDeclaration) : Import 
		{
			var result     = new Import();

			result.name    = ast.id.text;

			result.alias   = ast.getAliasName(ast);

			return result;
		}
	}
}
