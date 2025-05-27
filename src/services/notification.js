import { rootPaths } from "../routes/paths";
const URL = rootPaths.root + '/api/v1/notifications/';

const NotificationService = {
    createNotification: async (axiosPrivate, userId, message = {}, extra_data = {}, roles) => {
        console.log(userId);
        try {
            const response = await axiosPrivate.post(URL, {
                user: userId,
                roles: roles,
                notification: {
                    message: message,
                    extra_data: extra_data,
                },
                
            });
            return response.data;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    },
};

export default NotificationService;
