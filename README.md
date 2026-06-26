# \# TaskFlow — Task \& Workflow Management System

# 

# TaskFlow is a robust, full-stack enterprise task tracking and workflow management application designed with a decoupled architecture. The system features a stateless, secure backend built with Spring Boot and a responsive, dynamic user interface implemented using vanilla JavaScript, HTML5, and CSS3.

# 

# \## Core Features

# \* \*\*Role-Based Access Control (RBAC):\*\* Strict server-side enforcement separating administrative and standard user capabilities. Administrators maintain global visibility, while standard users interact strictly with self-created or assigned records.

# \* \*\*Stateless Authentication:\*\* Secure user registration and session management leveraging JSON Web Tokens (JWT) and one-way BCrypt cryptographic password hashing via Spring Security.

# \* \*\*Data Persistence:\*\* Relational database management utilizing MySQL, managed through Spring Data JPA for optimized object-relational mapping and data integrity.

# 

# \## Technical Tech Stack

# \* \*\*Backend:\*\* Java 17, Spring Boot 3, Spring Security (JWT), Spring Data JPA

# \* \*\*Database:\*\* MySQL

# \* \*\*Frontend:\*\* HTML5, CSS3, JavaScript (ES6+)

# 

# \## Architectural Highlights

# \* Implement decoupled frontend-to-backend communication via standard RESTful APIs.

# \* Enforce Cross-Origin Resource Sharing (CORS) configurations to ensure tight data transmission boundaries between the deployment domains.

