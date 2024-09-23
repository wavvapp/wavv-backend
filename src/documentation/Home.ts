
export const homeControllerDocs = {
    getHello: {
        description: 'List all users from the database',
        responses: {
            '400': {
                description: 'Bad request, check your credentials',
            },
        },
    },
    createUser: {
        description: "Create a new user to the database",
        parameters: [
            {
                in: 'path',
                name: 'userId',
                required: true,
                schema: {
                    type: 'string'
                }
            }
        ],
        responses: {
            '200': {
                description: 'Success'
            }
        }
    }
};