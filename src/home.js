import fulfillAPIRequest from 'react-storefront/props/fulfillAPIRequest'
import createAppData from './utils/createAppData'

export default async function home(req, res) {
  return await fulfillAPIRequest(req, {
    appData: createAppData,
    pageData: () =>
      Promise.resolve({
        title: 'React Storefront | Salesforce Commerce Cloud Connector',
        slots: {
          heading: 'Welcome',
          description: `
                <p>
                Enjoy our Salesforce Commerce Cloud Connector.
              </p>
              <p>Happy coding!</p>
            `,
        },
      }),
  })
}
