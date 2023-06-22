import { InvalidParamError, MissingParamError } from '../../errors'
import { badRequest, ok, serverError } from '../../helpers/http-helper'
import { type HttpRequest, type HttpResponse, type Controller } from '../../protocols'
import { type EmailValidator } from '../signup/signup-protocols'
import { type Authentication } from '../../../domain/usecases/authentication'

export class LoginController implements Controller {
  private readonly emailValidator: EmailValidator
  private readonly authentication: Authentication

  constructor (emailValidator: EmailValidator, authentication: Authentication) {
    this.emailValidator = emailValidator
    this.authentication = authentication
  }

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { email, password } = httpRequest.body

      if (!email) {
        return badRequest(new MissingParamError('email'))
      }

      if (!password) {
        return badRequest(new MissingParamError('password'))
      }

      const isValid = this.emailValidator.isValid(email)

      if (!isValid) {
        return badRequest(new InvalidParamError('email'))
      }

      const accessToken = await this.authentication.auth(email, password)

      return ok({
        accessToken
      })
    } catch (error) {
      return serverError(error)
    }
  }
}
