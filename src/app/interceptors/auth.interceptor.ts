import { HttpInterceptorFn } from "@angular/common/http";
import { environment } from "../../environments/environment";

export const AuthInterceptor : HttpInterceptorFn = (req, next) => {
    const auth = sessionStorage.getItem('token');
    if(auth && req.url.includes(environment.apiUser)){
        const accessToken = JSON.parse(auth).token;

        const cloned = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${accessToken}`)
        });

        return next(cloned);
    }
    return next(req);
}