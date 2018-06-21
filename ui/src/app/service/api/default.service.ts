/**
 * Model Editor API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: 0.0.1
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
/* tslint:disable:no-unused-variable member-ordering */

import { Inject, Injectable, Optional }                      from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams,
         HttpResponse, HttpEvent }                           from '@angular/common/http';
import { CustomHttpUrlEncodingCodec }                        from '../encoder';

import { Observable }                                        from 'rxjs/Observable';

import { DocCatalogEntry } from '../model/docCatalogEntry';
import { Model } from '../model/model';
import { ModelCatalogEntry } from '../model/modelCatalogEntry';
import { Success } from '../model/success';

import { BASE_PATH, COLLECTION_FORMATS }                     from '../variables';
import { Configuration }                                     from '../configuration';


@Injectable()
export class DefaultService {

    protected basePath = 'http://localhost:8081/meditor/api';
    public defaultHeaders = new HttpHeaders();
    public configuration = new Configuration();

    constructor(protected httpClient: HttpClient, @Optional()@Inject(BASE_PATH) basePath: string, @Optional() configuration: Configuration) {
        if (basePath) {
            this.basePath = basePath;
        }
        if (configuration) {
            this.configuration = configuration;
            this.basePath = basePath || configuration.basePath || this.basePath;
        }
    }

    /**
     * @param consumes string[] mime-types
     * @return true: consumes contains 'multipart/form-data', false: otherwise
     */
    private canConsumeForm(consumes: string[]): boolean {
        const form = 'multipart/form-data';
        for (let consume of consumes) {
            if (form === consume) {
                return true;
            }
        }
        return false;
    }


    /**
     * Gets a document
     * Gets a document
     * @param model Name of the Model
     * @param title Title of the document
     * @param version Version of the document
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public getDocument(model: string, title: string, version?: string, observe?: 'body', reportProgress?: boolean): Observable<any>;
    public getDocument(model: string, title: string, version?: string, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<any>>;
    public getDocument(model: string, title: string, version?: string, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<any>>;
    public getDocument(model: string, title: string, version?: string, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {
        if (model === null || model === undefined) {
            throw new Error('Required parameter model was null or undefined when calling getDocument.');
        }
        if (title === null || title === undefined) {
            throw new Error('Required parameter title was null or undefined when calling getDocument.');
        }

        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (model !== undefined) {
            queryParameters = queryParameters.set('model', <any>model);
        }
        if (title !== undefined) {
            queryParameters = queryParameters.set('title', <any>title);
        }
        if (version !== undefined) {
            queryParameters = queryParameters.set('version', <any>version);
        }

        let headers = this.defaultHeaders;

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
        ];
        let httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set("Accept", httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        let consumes: string[] = [
        ];

        return this.httpClient.get<any>(`${this.basePath}/getDocument`,
            {
                params: queryParameters,
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * Gets a document
     * Gets a document&#39;s history
     * @param model Name of the Model
     * @param title Title of the document
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public getDocumentHistory(model: string, title: string, observe?: 'body', reportProgress?: boolean): Observable<any>;
    public getDocumentHistory(model: string, title: string, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<any>>;
    public getDocumentHistory(model: string, title: string, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<any>>;
    public getDocumentHistory(model: string, title: string, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {
        if (model === null || model === undefined) {
            throw new Error('Required parameter model was null or undefined when calling getDocumentHistory.');
        }
        if (title === null || title === undefined) {
            throw new Error('Required parameter title was null or undefined when calling getDocumentHistory.');
        }

        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (model !== undefined) {
            queryParameters = queryParameters.set('model', <any>model);
        }
        if (title !== undefined) {
            queryParameters = queryParameters.set('title', <any>title);
        }

        let headers = this.defaultHeaders;

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
        ];
        let httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set("Accept", httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        let consumes: string[] = [
        ];

        return this.httpClient.get<any>(`${this.basePath}/getDocumentHistory`,
            {
                params: queryParameters,
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * Gets a Model
     * Gets a Model object
     * @param name Name of the model
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public getModel(name: string, observe?: 'body', reportProgress?: boolean): Observable<Model>;
    public getModel(name: string, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<Model>>;
    public getModel(name: string, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<Model>>;
    public getModel(name: string, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {
        if (name === null || name === undefined) {
            throw new Error('Required parameter name was null or undefined when calling getModel.');
        }

        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (name !== undefined) {
            queryParameters = queryParameters.set('name', <any>name);
        }

        let headers = this.defaultHeaders;

        // authentication (URS4) required
        if (this.configuration.accessToken) {
            let accessToken = typeof this.configuration.accessToken === 'function'
                ? this.configuration.accessToken()
                : this.configuration.accessToken;
            headers = headers.set('Authorization', 'Bearer ' + accessToken);
        }

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
        ];
        let httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set("Accept", httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        let consumes: string[] = [
        ];

        return this.httpClient.get<Model>(`${this.basePath}/getModel`,
            {
                params: queryParameters,
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * Lists documents of a given Model
     * Lists documents of a given Model
     * @param model Name of the Model
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public listDocuments(model: string, observe?: 'body', reportProgress?: boolean): Observable<Array<DocCatalogEntry>>;
    public listDocuments(model: string, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<Array<DocCatalogEntry>>>;
    public listDocuments(model: string, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<Array<DocCatalogEntry>>>;
    public listDocuments(model: string, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {
        if (model === null || model === undefined) {
            throw new Error('Required parameter model was null or undefined when calling listDocuments.');
        }

        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (model !== undefined) {
            queryParameters = queryParameters.set('model', <any>model);
        }

        let headers = this.defaultHeaders;

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
        ];
        let httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set("Accept", httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        let consumes: string[] = [
        ];

        return this.httpClient.get<Array<DocCatalogEntry>>(`${this.basePath}/listDocuments`,
            {
                params: queryParameters,
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * Lists Models
     * Lists &#39;Model&#39; objects each with an icon, description and count of number of instances of an object.
     * @param properties Comma-separated list of fields to be returned
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public listModels(properties?: Array<string>, observe?: 'body', reportProgress?: boolean): Observable<Array<ModelCatalogEntry>>;
    public listModels(properties?: Array<string>, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<Array<ModelCatalogEntry>>>;
    public listModels(properties?: Array<string>, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<Array<ModelCatalogEntry>>>;
    public listModels(properties?: Array<string>, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {

        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (properties) {
            queryParameters = queryParameters.set('properties', properties.join(COLLECTION_FORMATS['csv']));
        }

        let headers = this.defaultHeaders;

        // authentication (URS4) required
        if (this.configuration.accessToken) {
            let accessToken = typeof this.configuration.accessToken === 'function'
                ? this.configuration.accessToken()
                : this.configuration.accessToken;
            headers = headers.set('Authorization', 'Bearer ' + accessToken);
        }

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
        ];
        let httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set("Accept", httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        let consumes: string[] = [
        ];

        return this.httpClient.get<Array<ModelCatalogEntry>>(`${this.basePath}/listModels`,
            {
                params: queryParameters,
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * Puts a document
     * Puts a document
     * @param file Uploaded document file (JSON)
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public putDocument(file: Blob, observe?: 'body', reportProgress?: boolean): Observable<Success>;
    public putDocument(file: Blob, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<Success>>;
    public putDocument(file: Blob, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<Success>>;
    public putDocument(file: Blob, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {
        if (file === null || file === undefined) {
            throw new Error('Required parameter file was null or undefined when calling putDocument.');
        }

        let headers = this.defaultHeaders;

        // authentication (URS4) required
        if (this.configuration.accessToken) {
            let accessToken = typeof this.configuration.accessToken === 'function'
                ? this.configuration.accessToken()
                : this.configuration.accessToken;
            headers = headers.set('Authorization', 'Bearer ' + accessToken);
        }

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
        ];
        let httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set("Accept", httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        let consumes: string[] = [
            'multipart/form-data'
        ];

        const canConsumeForm = this.canConsumeForm(consumes);

        let formParams: { append(param: string, value: any): void; };
        let useForm = false;
        let convertFormParamsToString = false;
        // use FormData to transmit files using content-type "multipart/form-data"
        // see https://stackoverflow.com/questions/4007969/application-x-www-form-urlencoded-or-multipart-form-data
        useForm = canConsumeForm;
        if (useForm) {
            formParams = new FormData();
        } else {
            formParams = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        }

        if (file !== undefined) {
            formParams = formParams.append('file', <any>file) || formParams;
        }

        return this.httpClient.post<Success>(`${this.basePath}/putDocument`,
            convertFormParamsToString ? formParams.toString() : formParams,
            {
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * Adds a Model
     * Adds a Model object
     * @param file Uploaded model file (JSON)
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public putModel(file: Blob, observe?: 'body', reportProgress?: boolean): Observable<Success>;
    public putModel(file: Blob, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<Success>>;
    public putModel(file: Blob, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<Success>>;
    public putModel(file: Blob, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {
        if (file === null || file === undefined) {
            throw new Error('Required parameter file was null or undefined when calling putModel.');
        }

        let headers = this.defaultHeaders;

        // authentication (URS4) required
        if (this.configuration.accessToken) {
            let accessToken = typeof this.configuration.accessToken === 'function'
                ? this.configuration.accessToken()
                : this.configuration.accessToken;
            headers = headers.set('Authorization', 'Bearer ' + accessToken);
        }

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
        ];
        let httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set("Accept", httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        let consumes: string[] = [
            'multipart/form-data'
        ];

        const canConsumeForm = this.canConsumeForm(consumes);

        let formParams: { append(param: string, value: any): void; };
        let useForm = false;
        let convertFormParamsToString = false;
        // use FormData to transmit files using content-type "multipart/form-data"
        // see https://stackoverflow.com/questions/4007969/application-x-www-form-urlencoded-or-multipart-form-data
        useForm = canConsumeForm;
        if (useForm) {
            formParams = new FormData();
        } else {
            formParams = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        }

        if (file !== undefined) {
            formParams = formParams.append('file', <any>file) || formParams;
        }

        return this.httpClient.post<Success>(`${this.basePath}/putModel`,
            convertFormParamsToString ? formParams.toString() : formParams,
            {
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

}
