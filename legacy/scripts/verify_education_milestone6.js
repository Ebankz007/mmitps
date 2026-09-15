const http = require('http');

// Configuration
const BASE_URL = 'http://localhost:5005/api/v1';

// Helper for making requests
function request(method, path, body = null, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(`${BASE_URL}${path}`, options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = data ? JSON.parse(data) : {};
                    resolve({ status: res.statusCode, body: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });

        req.on('error', (e) => reject(e));

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

// Helpers
const get = (path, token) => request('GET', path, null, token);
const post = (path, body, token) => request('POST', path, body, token);
const patch = (path, body, token) => request('PATCH', path, body, token);

async function runTest() {
    console.log('🚀 Starting Milestone 6 Verification: Education System');
    console.log('---------------------------------------------------------');

    const uniqueId = Date.now().toString().slice(-6);

    // 1. Register Instructor (Admin for testing)
    console.log(`\n--- 1. Registering Instructor (Admin) ---`);
    const instructorEmail = `instructor.${uniqueId}@example.com`;
    const authRes = await post('/auth/register', {
        email: instructorEmail,
        password: 'Password123!',
        username: `instructor.${uniqueId}`,
        role: 'admin' // Admins can create courses
    });
    const instructorToken = authRes.body.data.tokens.access.token;
    console.log('Instructor Token Acquired');

    // 2. Register Student
    console.log(`\n--- 2. Registering Student ---`);
    const studentEmail = `student.${uniqueId}@example.com`;
    const studentRes = await post('/auth/register', {
        email: studentEmail,
        password: 'Password123!',
        username: `student.${uniqueId}`
    });
    const studentToken = studentRes.body.data.tokens.access.token;
    console.log('Student Token Acquired');

    // 3. Create Course
    console.log(`\n--- 3. Creating Course 'Crypto 101' ---`);
    const courseData = {
        title: `Crypto Trading 101 ${uniqueId}`,
        description: 'Learn the basics of crypto.',
        level: 'beginner',
        category: 'crypto',
        modules: [
            {
                title: 'Introduction',
                lessons: [
                    { title: 'What is Bitcoin?', content: 'Content A' },
                    { title: 'Blockchain Basics', content: 'Content B' }
                ]
            }
        ]
    };

    const createRes = await post('/education/courses', courseData, instructorToken);
    if (createRes.status === 201) {
        console.log('✅ Course Created. ID:', createRes.body.data._id);
        console.log('Slug:', createRes.body.data.slug);
    } else {
        console.log('❌ Course Creation Failed:', createRes.status, JSON.stringify(createRes.body, null, 2));
        return;
    }
    const courseId = createRes.body.data._id;
    const courseSlug = createRes.body.data.slug;
    const firstLessonId = createRes.body.data.modules[0].lessons[0]._id;

    // 4. Publish Course
    console.log(`\n--- 4. Publishing Course ---`);
    const publishRes = await patch(`/education/courses/${courseId}/publish`, {}, instructorToken);
    if (publishRes.status === 200) {
        console.log('✅ Course Published');
    } else {
        console.log('❌ Publish Failed:', publishRes.status);
    }

    // 5. Student Enrolls
    console.log(`\n--- 5. Student Enrolling ---`);
    const enrollRes = await post(`/education/courses/${courseId}/enroll`, {}, studentToken);
    if (enrollRes.status === 200) {
        console.log('✅ Enrollment Successful');
    } else {
        console.log('❌ Enrollment Failed:', enrollRes.status, JSON.stringify(enrollRes.body, null, 2));
    }

    // 6. Check Initial Progress
    console.log(`\n--- 6. Checking Initial Progress ---`);
    const progressRes = await get('/education/my-learning', studentToken);
    const myProgress = progressRes.body.data.find(p => p.course._id === courseId || p.course.id === courseId);
    console.log('Progress Percent:', myProgress ? myProgress.progressPercent : 'Not Found');

    // 7. Complete First Lesson
    console.log(`\n--- 7. Completing First Lesson ---`);
    const completeRes = await post(`/education/courses/${courseId}/lessons/${firstLessonId}/complete`, {}, studentToken);
    if (completeRes.status === 200) {
        console.log('✅ Lesson Completed. New Progress:', completeRes.body.data.progressPercent + '%');
    } else {
        console.log('❌ Lesson Completion Failed:', completeRes.status, JSON.stringify(completeRes.body, null, 2));
    }

    console.log('\n---------------------------------------------------------');
    console.log('End Verification');
}

runTest().catch(console.error);
