/*--------------------------------------------------------------------------

Copyright (c) 2013 haydn paterson (sinclair).  All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

--------------------------------------------------------------------------*/

/// <reference path="../references.ts" />

module TypeScript.Api {

	export class NullLogger implements TypeScript.ILogger {

		public information() : boolean {
             
			return false; 
		}
		
		public debug() : boolean {

			return false; 
		}
		
		public warning() : boolean {

			return false; 
		}
		
		public error()  : boolean {

			return false; 
		}
		
		public fatal(): boolean {

			return false; 
		}
		
		public log(s: string): void {

			// nothing doing..
		}
	}
}	