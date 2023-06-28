import { Route } from './Handler.d.ts'

export class Router {
  #routes: [string, RegExp, Route[]][] = []

  add(method: string, pathname: string, handler: Route[]) {
    this.#routes.push([
      method,
      RegExp(`^${pathname
          .replace(/(\/?)\*/g, '($1.*)?')
          .replace(/(\/$)|((?<=\/)\/)/, '')
          .replace(/(:(\w+)\+)/, '(?<$2>.*)')
          .replace(/:(\w+)(\?)?(\.)?/g, '$2(?<$1>[^/]+)$2$3')
          .replace(/\.(?=[\w(])/, '\\.')
        //.replace(/\)\.\?\(([^\[]+)\[\^/g, '?)\\.?($1(?<=\\.)[^\\.')
      }/*$`),
      handler,
    ])
  }

  match (method: string, pathname: string, preflight: boolean) {
 
    return (
       route => 
         route !== null
          ? {          
            handlers: route[2],
            params: pathname.match(route[1])?.groups as Record<string,string>,
          
          }
          : null
   
    )(
     this.#routes.find ( (x) => 
     (method === x[0] || 
     method === 'OPTIONS' ||
     preflight && 
     method === 'HEAD' && 
     x[0] === 'GET') && pathname.match(x[1])
     ) ?? null
    )
  }


}
