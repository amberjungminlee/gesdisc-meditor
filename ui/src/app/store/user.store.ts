import { Injectable, NgZone } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import { pluck, findWhere, union } from 'underscore'
import { DefaultService } from '../service/api/default.service'
import { Router } from '@angular/router'
import { NotificationStore } from './notification.store'
import { environment } from '../../environments/environment'
import { MatDialog } from '@angular/material'
import { LoginDialog } from '../auth/components/login-dialog/login-dialog.component'
import { SessionTimeoutDialog } from '../auth/components/session-timeout-dialog/session-timeout-dialog.component'
import { Privilege } from '../service'

const ROLE_KEY = 'role'

@Injectable({ providedIn: 'root' })
export class UserStore {
    private readonly _loggedIn = new BehaviorSubject<boolean>(false)
    private readonly _user = new BehaviorSubject<any>(null)

    readonly loggedIn$ = this._loggedIn.asObservable()
    readonly user$ = this._user.asObservable()

    private sessionTimeoutDialogRef: any

    constructor(
        private service: DefaultService,
        private ngZone: NgZone,
        private router: Router,
        private notificationStore: NotificationStore,
        private dialog: MatDialog
    ) {
        //
    }

    get loggedIn(): boolean {
        return this._loggedIn.getValue()
    }

    set loggedIn(loggedIn: boolean) {
        this._loggedIn.next(loggedIn)
    }

    get user(): any {
        return this._user.getValue()
    }

    set user(user: any) {
        this._user.next(user)
    }

    /**
     * retrieves logged in user from the API service
     */
    async fetchUser(isLogin: boolean = false) {
        try {
            this.user = await this.service.getMe().toPromise()
            this.loggedIn = true

            if (isLogin) {
                this.handleLoginSuccess(this.user)
            }

            return this.user
        } catch (err) {
            console.error('Failed to fetch user ', err)
        }
    }

    /**
     * logs the current user out of mEditor
     */
    async logout() {
        window.location.href = this.getApiUrl() + '/logout'
    }

    /**
     * given a model, will return the privileges the user has for that model
     * @param modelName
     */
    retrievePrivilegesForModel(modelName: string, currentNodePrivileges: Privilege[]) {
        let privileges: string[] = []

        const currentUserRoles = pluck(
            this.user.roles.filter((role: any) => role.model === modelName),
            ROLE_KEY
        )

        if (currentNodePrivileges) {
            currentUserRoles.forEach(role => {
                let nodePrivilege = findWhere(currentNodePrivileges, { [`${ROLE_KEY}`]: role })

                if (nodePrivilege) {
                    privileges = union(privileges, nodePrivilege.privilege)
                }
            })
        }

        return privileges
    }

    /**
     * opens the login dialog
     * TODO: move this to a component, the store shouldn't handle showing/hiding dialogs
     */
    openLoginDialog() {
        this.ngZone.run(() => {
            this.dialog.open(LoginDialog, {
                width: '400px',
                position: { top: '200px' },
                disableClose: true,
            })
        })
    }

    /**
     * opens the session timeout dialog
     * TODO: move this to a component, the store shouldn't handle showing/hiding dialogs
     */
    openSessionTimeoutDialog() {
        if (this.sessionTimeoutDialogRef) return

        this.ngZone.run(() => {
            this.sessionTimeoutDialogRef = this.dialog.open(SessionTimeoutDialog, {
                width: '400px',
                position: { top: '200px' },
            })
        })
    }

    private handleLoginSuccess(user: any) {
        // navigate back to the original URL the user was trying to access (or the dashboard)
        this.ngZone.run(() => {
            this.router.navigateByUrl(localStorage.getItem('returnUrl') || '/')
        })

        this.notificationStore.showSuccessNotification('You have successfully logged in')
    }

    private getApiUrl() {
        const basePath = environment.API_BASE_PATH
        return basePath.indexOf('http') !== 0 ? window.location.origin + basePath : basePath
    }
}